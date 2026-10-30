import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const schoolSource = await readFile(fileURLToPath(new URL("../school.js", import.meta.url)), "utf8");
const schoolModule = await import(`data:text/javascript;base64,${Buffer.from(schoolSource).toString("base64")}`);
const { getAssessmentState, getSchoolDisplayName, normalizeAssessmentQuestions, scoreAssessment } = schoolModule;

test("School display name is independent from the chat name", () => {
    assert.equal(
        getSchoolDisplayName({ displayName: "Real Name", email: "chatname@example.com" }, "School Name"),
        "School Name"
    );
    assert.equal(
        getSchoolDisplayName({ displayName: "Real Name", email: "chatname@example.com" }, ""),
        "Real Name"
    );
});

test("calculator is blocked only during an active math assessment", () => {
    assert.deepEqual(getAssessmentState(), { active: false, isMath: false });
    assert.deepEqual(getAssessmentState({ subject: "math" }), { active: true, isMath: true });
    assert.deepEqual(getAssessmentState({ subject: "science" }), { active: true, isMath: false });
});

test("Gemini is blocked during any active assessment", () => {
    assert.equal(getAssessmentState().active, false);
    assert.equal(getAssessmentState({ subject: "math" }).active, true);
    assert.equal(getAssessmentState({ subject: "science" }).active, true);
});

test("assessment questions accept multiple choice questions with valid answer indexes", () => {
    assert.deepEqual(normalizeAssessmentQuestions([{
        prompt: "  What is 2 + 2? ",
        options: ["3", "4"],
        correctAnswer: "1"
    }]), [{
        prompt: "What is 2 + 2?",
        options: ["3", "4"],
        correctAnswer: 1
    }]);
});

test("assessment question validation rejects missing prompts, invalid options, and invalid answers", () => {
    assert.throws(() => normalizeAssessmentQuestions([]), /between 1 and 50/);
    assert.throws(() => normalizeAssessmentQuestions([{ prompt: "", options: ["A", "B"], correctAnswer: 0 }]), /needs a prompt/);
    assert.throws(() => normalizeAssessmentQuestions([{ prompt: "Pick", options: ["A"], correctAnswer: 0 }]), /2 to 6 options/);
    assert.throws(() => normalizeAssessmentQuestions([{ prompt: "Pick", options: ["A", "B"], correctAnswer: 2 }]), /valid correct answer/);
});

test("written math questions save a correct answer while ELA and science questions require teacher review", () => {
    assert.deepEqual(normalizeAssessmentQuestions([{
        type: "written",
        prompt: "What is 2 + 2?",
        correctAnswer: " 4 "
    }], "math"), [{
        type: "written",
        prompt: "What is 2 + 2?",
        correctAnswer: "4"
    }]);
    for (const subject of ["ela", "science"]) {
        assert.deepEqual(normalizeAssessmentQuestions([{
            type: "written",
            prompt: "Explain your answer."
        }], subject), [{
            type: "written",
            prompt: "Explain your answer.",
            requiresReview: true
        }]);
    }
});

test("written math questions require a valid correct answer", () => {
    assert.throws(() => normalizeAssessmentQuestions([{
        type: "written",
        prompt: "What is 2 + 2?",
        correctAnswer: ""
    }], "math"), /Enter a correct answer/);
});

test("assessment scoring counts only matching correct answer indexes", () => {
    const questions = [
        { prompt: "Q1", options: ["A", "B"], correctAnswer: 1 },
        { prompt: "Q2", options: ["A", "B", "C"], correctAnswer: 2 }
    ];
    assert.deepEqual(scoreAssessment(questions, [1, 0]), { score: 1, totalQuestions: 2, reviewCount: 0 });
    assert.throws(() => scoreAssessment(questions, [1]), /match the assessment question count/);
});

test("assessment scoring auto-grades written math and excludes teacher-review answers", () => {
    const questions = [
        { prompt: "Choice", options: ["A", "B"], correctAnswer: 1 },
        { type: "written", prompt: "Math", correctAnswer: "4" },
        { type: "written", prompt: "Explain", requiresReview: true }
    ];
    assert.deepEqual(scoreAssessment(questions, [1, " 4 ", "A detailed response"]), {
        score: 2,
        totalQuestions: 2,
        reviewCount: 1
    });
    assert.deepEqual(scoreAssessment([questions[2]], ["response"]), {
        score: 0,
        totalQuestions: 0,
        reviewCount: 1
    });
});

test("active assessment state stored by another tab blocks calculator and Gemini", () => {
    const stored = new Map();
    const originalStorage = globalThis.localStorage;
    globalThis.localStorage = {
        getItem: key => stored.get(key) ?? null,
        setItem: (key, value) => stored.set(key, String(value)),
        removeItem: key => stored.delete(key)
    };
    try {
        const app = {};
        schoolModule.configureVAiiSchool({ app, auth: { app, currentUser: { uid: "student-1" } } });
        stored.set("vaii_school_active_assessments_v1", JSON.stringify({
            "student-1": {
                userId: "student-1",
                teacherId: "teacher-1",
                testId: "test-1",
                subject: "math"
            }
        }));

        assert.deepEqual(getAssessmentState(), { active: true, isMath: true });

        stored.set("vaii_school_active_assessments_v1", JSON.stringify({
            "student-1": {
                userId: "student-1",
                teacherId: "teacher-1",
                testId: "test-2",
                subject: "science"
            }
        }));
        assert.deepEqual(getAssessmentState(), { active: true, isMath: false });

        stored.delete("vaii_school_active_assessments_v1");
        assert.deepEqual(getAssessmentState(), { active: false, isMath: false });
    } finally {
        globalThis.localStorage = originalStorage;
    }
});
