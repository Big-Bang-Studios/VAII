import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const schoolSource = await readFile(fileURLToPath(new URL("../school.js", import.meta.url)), "utf8");
const schoolModule = await import(`data:text/javascript;base64,${Buffer.from(schoolSource).toString("base64")}`);
const { getSchoolDisplayName, isMathAssessmentActive, normalizeAssessmentQuestions, scoreAssessment } = schoolModule;

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
    assert.equal(isMathAssessmentActive(), false);
    assert.equal(isMathAssessmentActive({ subject: "math" }), true);
    assert.equal(isMathAssessmentActive({ subject: "science" }), false);
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

test("assessment scoring counts only matching correct answer indexes", () => {
    const questions = [
        { prompt: "Q1", options: ["A", "B"], correctAnswer: 1 },
        { prompt: "Q2", options: ["A", "B", "C"], correctAnswer: 2 }
    ];
    assert.deepEqual(scoreAssessment(questions, [1, 0]), { score: 1, totalQuestions: 2 });
    assert.throws(() => scoreAssessment(questions, [1]), /match the assessment question count/);
});
