const FIREBASE_VERSION = "10.8.0";
const FIRESTORE_URL = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`;
const TEACHERS_KEY = "vaii_school_teachers_v1";
const SCHOOL_NAME_KEY = "vaii_school_display_name_v1";
const SUBJECTS = ["math", "ela", "science"];

let firebaseApp = null;
let firebaseAuth = null;
let firestorePromise = null;
let overlay = null;
let content = null;
let pendingAssessmentCount = 0;
let pendingAssessmentHandler = () => {};
let activeUserId = null;
let processedInvite = null;
let activeAssessment = null;

export function isAssessmentActive(assessment = activeAssessment) {
    return Boolean(assessment);
}

export function isMathAssessmentActive(assessment = activeAssessment) {
    return assessment?.subject === "math";
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

export function getSchoolDisplayName(user = firebaseAuth?.currentUser, savedName = localStorage.getItem(SCHOOL_NAME_KEY)) {
    const name = savedName || user?.displayName || user?.email?.split("@")[0] || "Student";
    return String(name).trim().slice(0, 30) || "Student";
}

function getTeacherIds(userId = firebaseAuth?.currentUser?.uid) {
    if (!userId) return [];
    const saved = JSON.parse(localStorage.getItem(TEACHERS_KEY) || "{}");
    const teacherIds = saved[userId];
    return Array.isArray(teacherIds) ? [...new Set(teacherIds.filter(id => typeof id === "string" && id))] : [];
}

function saveTeacherId(userId, teacherId) {
    const saved = JSON.parse(localStorage.getItem(TEACHERS_KEY) || "{}");
    const teacherIds = Array.isArray(saved[userId]) ? saved[userId] : [];
    if (!teacherIds.includes(teacherId)) teacherIds.push(teacherId);
    saved[userId] = teacherIds;
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(saved));
}

export function normalizeAssessmentQuestions(questions) {
    if (!Array.isArray(questions) || questions.length < 1 || questions.length > 50) {
        throw new Error("An assessment must have between 1 and 50 questions.");
    }

    return questions.map((question, index) => {
        const prompt = String(question?.prompt || "").trim();
        const options = Array.isArray(question?.options)
            ? question.options.map(option => String(option || "").trim()).filter(Boolean)
            : [];
        const correctAnswer = Number(question?.correctAnswer);
        if (!prompt || prompt.length > 500) throw new Error(`Question ${index + 1} needs a prompt (maximum 500 characters).`);
        if (options.length < 2 || options.length > 6 || options.some(option => option.length > 200)) {
            throw new Error(`Question ${index + 1} needs 2 to 6 options, each no longer than 200 characters.`);
        }
        if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
            throw new Error(`Select a valid correct answer for question ${index + 1}.`);
        }
        return { prompt, options, correctAnswer };
    });
}

export function scoreAssessment(questions, answers) {
    if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
        throw new Error("Answers must match the assessment question count.");
    }
    const score = questions.reduce((total, question, index) =>
        total + (Number(answers[index]) === question.correctAnswer ? 1 : 0), 0);
    return { score, totalQuestions: questions.length };
}

async function getFirestore() {
    if (!firestorePromise) {
        firestorePromise = import(FIRESTORE_URL).then(module => {
            if (!firebaseApp) throw new Error("Firebase is not configured for VAII School.");
            return {
                db: module.getFirestore(firebaseApp),
                doc: module.doc,
                getDoc: module.getDoc,
                setDoc: module.setDoc,
                updateDoc: module.updateDoc,
                arrayUnion: module.arrayUnion,
                collection: module.collection,
                addDoc: module.addDoc,
                getDocs: module.getDocs,
                serverTimestamp: module.serverTimestamp
            };
        }).catch(error => {
            firestorePromise = null;
            throw error;
        });
    }
    return firestorePromise;
}

function getUser() {
    const user = firebaseAuth?.currentUser;
    if (!user) throw new Error("Sign in to use VAII School.");
    return user;
}

function setPendingAssessmentCount(count) {
    pendingAssessmentCount = count;
    pendingAssessmentHandler(count);
}

function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "vaii-school-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "vaii-school-title");
    overlay.style.cssText = "position:fixed;inset:0;z-index:10020;background:#101318;color:#f0f3f6;display:flex;flex-direction:column;font-family:system-ui,-apple-system,sans-serif;";
    overlay.innerHTML = `
        <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;background:#171c24;border-bottom:1px solid #303744;flex-shrink:0;">
            <div><div id="vaii-school-title" style="font-size:1.1rem;font-weight:800;color:#72d99a;">📚 VAII School</div><div style="font-size:.76rem;color:#9ba6b2;">Learning and assessment center</div></div>
            <button type="button" data-school-action="close" aria-label="Close VAII School" style="border:1px solid #424c5b;background:#252c36;color:#fff;padding:8px 12px;border-radius:7px;cursor:pointer;">✕ Close</button>
        </header>
        <main id="vaii-school-content" style="min-height:0;overflow-y:auto!important;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;flex:1;padding:20px;max-width:1000px;width:100%;margin:0 auto;"></main>`;
    document.body.appendChild(overlay);
    content = overlay.querySelector("#vaii-school-content");
    overlay.addEventListener("click", handleSchoolClick);
    overlay.addEventListener("submit", handleSchoolSubmit);
    overlay.addEventListener("keydown", event => {
        if (event.key === "Escape") closeSchool();
    });
}

function closeSchool() {
    if (overlay) overlay.style.display = "none";
}

function openSchoolError(error) {
    console.error("VAII School operation failed:", error);
    if (!content) return;
    content.innerHTML = `<div role="alert" style="padding:14px;border:1px solid #8d3d43;background:#321c20;border-radius:8px;color:#ffd2d5;">${escapeHtml(error.message || "VAII School could not load.")}<div style="margin-top:12px;"><button type="button" data-school-action="home" style="padding:8px 12px;border:0;border-radius:6px;background:#343b45;color:#fff;cursor:pointer;">Back to School</button></div></div>`;
}

function renderLoading(message = "Loading VAII School…") {
    content.innerHTML = `<div role="status" style="color:#abb5c1;padding:24px;text-align:center;">${escapeHtml(message)}</div>`;
}

async function renderHome() {
    renderLoading();
    try {
        const user = getUser();
        const firestore = await getFirestore();
        const teacherRef = firestore.doc(firestore.db, "vaii_schools", user.uid);
        const teacherSnapshot = await firestore.getDoc(teacherRef);
        const teacherData = teacherSnapshot.exists() ? teacherSnapshot.data() : null;
        const teacherIds = getTeacherIds(user.uid);
        let linkedTeachers = [];
        let studentTests = [];

        for (const teacherId of teacherIds) {
            const linkedTeacher = await firestore.getDoc(firestore.doc(firestore.db, "vaii_schools", teacherId));
            if (!linkedTeacher.exists()) continue;
            const data = linkedTeacher.data();
            linkedTeachers.push({ id: teacherId, name: data.teacherName || teacherId });
            const tests = await firestore.getDocs(firestore.collection(firestore.db, "vaii_schools", teacherId, "assessments"));
            for (const test of tests.docs) {
                const submission = await firestore.getDoc(firestore.doc(firestore.db, "vaii_schools", teacherId, "assessments", test.id, "submissions", user.uid));
                studentTests.push({ id: test.id, teacherId, teacherName: data.teacherName || teacherId, ...test.data(), submitted: submission.exists(), result: submission.exists() ? submission.data() : null });
            }
        }

        const inviteUrl = teacherData ? buildInviteUrl(user.uid, teacherData.teacherName || getSchoolDisplayName(user)) : "";
        const schoolProfile = `<section style="${cardStyle()}"><h2 style="margin:0 0 8px;">School profile</h2><label style="display:block;color:#aab4bf;">Your name in VAII School<input id="vaii-school-display-name" aria-label="Your School name" maxlength="30" required value="${escapeHtml(getSchoolDisplayName(user))}" style="${inputStyle()}display:block;width:100%;margin-top:5px;"></label><button type="button" data-school-action="save-name" style="${buttonStyle("#257a50")}margin-top:10px;">Save School name</button><span id="vaii-school-name-status" role="status" style="margin-left:10px;color:#72d99a;"></span><div id="vaii-school-name-error" role="alert" style="color:#ff8b8b;margin-top:8px;"></div></section>`;
        const teacherSection = teacherData
            ? `<section style="${cardStyle()}"><h2 style="margin:0 0 8px;">Teacher dashboard</h2><p style="color:#aab4bf;">Share this invite link with students:</p><div style="display:flex;gap:8px;flex-wrap:wrap;"><input readonly value="${escapeHtml(inviteUrl)}" aria-label="Teacher invite link" style="${inputStyle()}flex:1;min-width:220px;"><button type="button" data-school-action="copy-invite" style="${buttonStyle("#257a50")}">Copy invite</button></div><button type="button" data-school-action="builder" style="${buttonStyle("#257a50")}margin-top:14px;">＋ Create assessment</button><div id="vaii-school-teacher-tests" style="margin-top:14px;">Loading assessments…</div></section>`
            : `<section style="${cardStyle()}"><h2 style="margin:0 0 8px;">Teach with VAII School</h2><p style="color:#aab4bf;">Create assessments, share an invite link, and review student results.</p><button type="button" data-school-action="become-teacher" style="${buttonStyle("#257a50")}">Become a teacher</button></section>`;

        content.innerHTML = `
            <div style="display:grid;gap:16px;">
                ${schoolProfile}
                ${teacherSection}
                <section style="${cardStyle()}"><h2 style="margin:0 0 12px;">Assigned assessments</h2>
                    ${linkedTeachers.length ? `<p style="color:#aab4bf;margin-top:0;">Linked to: ${linkedTeachers.map(teacher => escapeHtml(teacher.name)).join(", ")}</p>` : `<p style="color:#aab4bf;">No teachers linked yet. Ask your teacher to share their VAII School invite link.</p>`}
                    ${studentTests.length ? studentTests.map(test => renderStudentTestCard(test)).join("") : ""}
                </section>
            </div>`;

        if (teacherData) renderTeacherTests(teacherData, user.uid).catch(openSchoolError);
    } catch (error) {
        openSchoolError(error);
    }
}

function cardStyle() {
    return "background:#191f28;border:1px solid #303a47;border-radius:10px;padding:16px;";
}

function inputStyle() {
    return "background:#10151b;border:1px solid #3b4654;color:#f0f3f6;padding:9px;border-radius:6px;";
}

function buttonStyle(color = "#2c3745") {
    return `background:${color};border:0;color:#fff;padding:9px 13px;border-radius:6px;font-weight:700;cursor:pointer;`;
}

function renderStudentTestCard(test) {
    return `<article style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px solid #303a47;padding:12px 0;">
        <div><strong>${escapeHtml(test.title)}</strong><div style="color:#9ba6b2;font-size:.82rem;">${escapeHtml(test.subject.toUpperCase())} · ${test.questions?.length || 0} questions · ${escapeHtml(test.teacherName)}${test.submitted ? ` · Score: ${test.result.score}/${test.result.totalQuestions}` : ""}</div></div>
        ${test.submitted ? `<span style="color:#72d99a;font-weight:700;">Completed</span>` : `<button type="button" data-school-action="take" data-teacher-id="${escapeHtml(test.teacherId)}" data-test-id="${escapeHtml(test.id)}" style="${buttonStyle("#257a50")}">Take assessment</button>`}
    </article>`;
}

async function renderTeacherTests(teacherData, teacherId) {
    const list = document.getElementById("vaii-school-teacher-tests");
    if (!list) return;
    const firestore = await getFirestore();
    const tests = await firestore.getDocs(firestore.collection(firestore.db, "vaii_schools", teacherId, "assessments"));
    list.innerHTML = tests.empty ? `<div style="color:#9ba6b2;">No assessments created yet.</div>` : tests.docs.map(test => `
        <article style="border-top:1px solid #303a47;padding:12px 0;">
            <button type="button" data-school-action="results" data-test-id="${escapeHtml(test.id)}" style="width:100%;text-align:left;background:transparent;border:0;color:#fff;padding:0;cursor:pointer;">
                <strong>${escapeHtml(test.data().title)}</strong> <span style="color:#9ba6b2;">· ${escapeHtml(test.data().subject.toUpperCase())} · ${test.data().questions?.length || 0} questions</span>
            </button>
        </article>`).join("");
}

function buildInviteUrl(teacherId, teacherName) {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("joinSchool", teacherId);
    url.searchParams.set("teacher", teacherName);
    return url.href;
}

async function becomeTeacher() {
    const user = getUser();
    const teacherName = getSchoolDisplayName(user);
    const firestore = await getFirestore();
    const teacherRef = firestore.doc(firestore.db, "vaii_schools", user.uid);
    const existing = await firestore.getDoc(teacherRef);
    if (existing.exists()) {
        await firestore.updateDoc(teacherRef, { teacherName });
    } else {
        await firestore.setDoc(teacherRef, {
            teacherId: user.uid,
            teacherName,
            students: [],
            createdAt: firestore.serverTimestamp()
        });
    }
    await renderHome();
}

async function saveSchoolName() {
    const user = getUser();
    const input = overlay.querySelector("#vaii-school-display-name");
    const name = input.value.trim();
    if (!name || name.length > 30) throw new Error("Enter a School name between 1 and 30 characters.");
    const firestore = await getFirestore();
    const teacherRef = firestore.doc(firestore.db, "vaii_schools", user.uid);
    const teacherSnapshot = await firestore.getDoc(teacherRef);
    if (teacherSnapshot.exists()) await firestore.updateDoc(teacherRef, { teacherName: name });
    localStorage.setItem(SCHOOL_NAME_KEY, name);
    await renderHome();
    const status = document.getElementById("vaii-school-name-status");
    if (status) status.textContent = "Name saved.";
}

function renderBuilder() {
    content.innerHTML = `
        <section style="${cardStyle()}">
            <button type="button" data-school-action="home" style="${buttonStyle()}margin-bottom:12px;">← School home</button>
            <h2 style="margin:4px 0 14px;">Create assessment</h2>
            <form id="vaii-school-builder">
                <label style="display:block;margin-bottom:10px;">Assessment title<input name="title" maxlength="80" required style="${inputStyle()}width:100%;margin-top:5px;"></label>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <label>Subject<select name="subject" required style="${inputStyle()}display:block;margin-top:5px;">${SUBJECTS.map(subject => `<option value="${subject}">${subject.toUpperCase()}</option>`).join("")}</select></label>
                    <label>Question count<input name="count" type="number" min="1" max="50" value="3" required style="${inputStyle()}display:block;margin-top:5px;width:110px;"></label>
                </div>
                <div id="vaii-school-question-fields" style="display:grid;gap:12px;margin:16px 0;"></div>
                <div id="vaii-school-form-error" role="alert" style="color:#ff8b8b;margin-bottom:10px;"></div>
                <button type="submit" style="${buttonStyle("#257a50")}">Publish assessment</button>
            </form>
        </section>`;
    const builder = document.getElementById("vaii-school-builder");
    const countInput = builder.elements.count;
    renderQuestionFields(3);
    countInput.addEventListener("input", () => {
        const count = Math.max(1, Math.min(50, Number(countInput.value) || 1));
        renderQuestionFields(count);
    });
}

function renderQuestionFields(count) {
    const fields = document.getElementById("vaii-school-question-fields");
    if (!fields) return;
    fields.innerHTML = Array.from({ length: count }, (_, index) => `
        <fieldset data-school-question="${index}" style="border:1px solid #384351;border-radius:8px;padding:12px;">
            <legend style="font-weight:700;">Question ${index + 1}</legend>
            <label style="display:block;">Prompt<textarea name="prompt-${index}" maxlength="500" required rows="2" style="${inputStyle()}width:100%;margin-top:5px;"></textarea></label>
            <label style="display:block;margin-top:8px;">Multiple-choice options (one per line, 2–6)<textarea name="options-${index}" required rows="4" style="${inputStyle()}width:100%;margin-top:5px;" placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"></textarea></label>
            <label style="display:block;margin-top:8px;">Correct option<select name="answer-${index}" style="${inputStyle()}display:block;margin-top:5px;"><option value="0">Option 1</option><option value="1">Option 2</option><option value="2">Option 3</option><option value="3">Option 4</option><option value="4">Option 5</option><option value="5">Option 6</option></select></label>
        </fieldset>`).join("");
}

async function publishAssessment(form) {
    const formData = new FormData(form);
    const count = Number(formData.get("count"));
    const title = String(formData.get("title") || "").trim();
    const subject = String(formData.get("subject") || "");
    if (!title || title.length > 80) throw new Error("Enter a title between 1 and 80 characters.");
    if (!SUBJECTS.includes(subject)) throw new Error("Choose a supported subject.");
    if (!Number.isInteger(count) || count < 1 || count > 50) throw new Error("Choose between 1 and 50 questions.");
    const rawQuestions = Array.from({ length: count }, (_, index) => ({
        prompt: formData.get(`prompt-${index}`),
        options: String(formData.get(`options-${index}`) || "").split("\n"),
        correctAnswer: formData.get(`answer-${index}`)
    }));
    const questions = normalizeAssessmentQuestions(rawQuestions);
    const user = getUser();
    const firestore = await getFirestore();
    await firestore.addDoc(firestore.collection(firestore.db, "vaii_schools", user.uid, "assessments"), {
        teacherId: user.uid,
        subject,
        title,
        questions,
        createdAt: firestore.serverTimestamp()
    });
    await renderHome();
}

async function renderAssessmentResults(testId) {
    renderLoading("Loading student results…");
    try {
        const user = getUser();
        const firestore = await getFirestore();
        const testRef = firestore.doc(firestore.db, "vaii_schools", user.uid, "assessments", testId);
        const testSnapshot = await firestore.getDoc(testRef);
        if (!testSnapshot.exists()) throw new Error("Assessment was not found.");
        const assessment = testSnapshot.data();
        const submissions = await firestore.getDocs(firestore.collection(firestore.db, "vaii_schools", user.uid, "assessments", testId, "submissions"));
        content.innerHTML = `
            <section style="${cardStyle()}">
                <button type="button" data-school-action="home" style="${buttonStyle()}margin-bottom:12px;">← School home</button>
                <h2 style="margin:4px 0;">${escapeHtml(assessment.title)} — results</h2>
                ${submissions.empty ? `<p style="color:#9ba6b2;">No student submissions yet.</p>` : submissions.docs.map(snapshot => {
                    const result = snapshot.data();
                    const answers = Array.isArray(result.answers) ? result.answers : [];
                    return `<article style="border-top:1px solid #303a47;padding:12px 0;">
                        <strong>${escapeHtml(result.studentName || snapshot.id)}</strong> — ${escapeHtml(result.score)}/${escapeHtml(result.totalQuestions)}
                        <ol style="color:#b7c0ca;padding-left:24px;">${assessment.questions.map((question, index) => {
                            const selected = Number(answers[index]);
                            const answerLabel = question.options?.[selected] || "No answer";
                            const correctLabel = question.options?.[question.correctAnswer] || "Unavailable";
                            return `<li>${escapeHtml(question.prompt)}<br><span style="color:${selected === question.correctAnswer ? "#72d99a" : "#ff9b9b"};">Student: ${escapeHtml(answerLabel)}</span> · Correct: ${escapeHtml(correctLabel)}</li>`;
                        }).join("")}</ol>
                    </article>`;
                }).join("")}
            </section>`;
    } catch (error) {
        openSchoolError(error);
    }
}

async function openAssessment(teacherId, testId) {
    renderLoading("Loading assessment…");
    try {
        const user = getUser();
        const firestore = await getFirestore();
        const testRef = firestore.doc(firestore.db, "vaii_schools", teacherId, "assessments", testId);
        const submissionRef = firestore.doc(firestore.db, "vaii_schools", teacherId, "assessments", testId, "submissions", user.uid);
        const [testSnapshot, submissionSnapshot] = await Promise.all([firestore.getDoc(testRef), firestore.getDoc(submissionRef)]);
        if (!testSnapshot.exists()) throw new Error("This assessment is no longer available.");
        if (submissionSnapshot.exists()) throw new Error("You have already submitted this assessment.");
        const assessment = testSnapshot.data();
        const questions = normalizeAssessmentQuestions(assessment.questions);
        activeAssessment = { teacherId, testId, title: assessment.title, subject: assessment.subject, questions };
        content.innerHTML = `
            <section style="${cardStyle()}">
                <button type="button" data-school-action="home" style="${buttonStyle()}margin-bottom:12px;">← School home</button>
                <h2 style="margin:4px 0 6px;">${escapeHtml(assessment.title)}</h2>
                <p style="color:#9ba6b2;">${escapeHtml(assessment.subject.toUpperCase())} · ${questions.length} questions</p>
                <form id="vaii-school-test-form">
                    ${questions.map((question, index) => `<fieldset style="border:1px solid #384351;border-radius:8px;padding:12px;margin:12px 0;">
                        <legend style="font-weight:700;">${index + 1}. ${escapeHtml(question.prompt)}</legend>
                        ${question.options.map((option, optionIndex) => `<label style="display:flex;gap:8px;padding:6px;cursor:pointer;"><input type="radio" name="answer-${index}" value="${optionIndex}" required><span>${escapeHtml(option)}</span></label>`).join("")}
                    </fieldset>`).join("")}
                    <div id="vaii-school-form-error" role="alert" style="color:#ff8b8b;margin-bottom:10px;"></div>
                    <button type="submit" style="${buttonStyle("#257a50")}">Submit assessment</button>
                </form>
            </section>`;
    } catch (error) {
        openSchoolError(error);
    }
}

async function submitAssessment(form) {
    const assessment = activeAssessment;
    if (!assessment) throw new Error("No assessment is open.");
    const formData = new FormData(form);
    const answers = assessment.questions.map((_, index) => {
        const answer = formData.get(`answer-${index}`);
        if (answer === null) throw new Error(`Answer question ${index + 1} before submitting.`);
        return Number(answer);
    });
    const { score, totalQuestions } = scoreAssessment(assessment.questions, answers);
    const user = getUser();
    const firestore = await getFirestore();
    const submissionRef = firestore.doc(firestore.db, "vaii_schools", assessment.teacherId, "assessments", assessment.testId, "submissions", user.uid);
    await firestore.setDoc(submissionRef, {
        studentId: user.uid,
        studentName: getSchoolDisplayName(user),
        score,
        totalQuestions,
        answers,
        submittedAt: firestore.serverTimestamp()
    });
    activeAssessment = null;
    content.innerHTML = `<section style="${cardStyle()}text-align:center;"><h2 style="color:#72d99a;">Assessment submitted</h2><p>You scored <strong>${score}/${totalQuestions}</strong>.</p><button type="button" data-school-action="home" style="${buttonStyle("#257a50")}">Back to VAII School</button></section>`;
    await refreshPendingAssessments();
}

function showFormError(error) {
    const errorElement = document.querySelector("#vaii-school-form-error, #vaii-school-name-error");
    if (errorElement) errorElement.textContent = error.message || "Could not save the assessment.";
    else openSchoolError(error);
}

async function handleSchoolClick(event) {
    const button = event.target.closest("[data-school-action]");
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.schoolAction;
    try {
        if (action === "close") closeSchool();
        if (action === "home") await renderHome();
        if (action === "become-teacher") await becomeTeacher();
        if (action === "save-name") await saveSchoolName();
        if (action === "builder") renderBuilder();
        if (action === "take") await openAssessment(button.dataset.teacherId, button.dataset.testId);
        if (action === "results") await renderAssessmentResults(button.dataset.testId);
        if (action === "copy-invite") {
            const input = overlay.querySelector('input[aria-label="Teacher invite link"]');
            await navigator.clipboard.writeText(input.value);
            button.textContent = "Copied!";
        }
    } catch (error) {
        if (action === "save-name") showFormError(error);
        else openSchoolError(error);
    }
}

async function handleSchoolSubmit(event) {
    const form = event.target;
    if (!form.matches("#vaii-school-builder, #vaii-school-test-form")) return;
    event.preventDefault();
    try {
        if (form.id === "vaii-school-builder") await publishAssessment(form);
        else await submitAssessment(form);
    } catch (error) {
        showFormError(error);
    }
}

async function joinFromInvite(user) {
    const params = new URLSearchParams(window.location.search);
    const teacherId = params.get("joinSchool");
    if (!teacherId || teacherId === user.uid) return false;
    const inviteKey = `${user.uid}:${teacherId}`;
    if (processedInvite === inviteKey) return false;
    const firestore = await getFirestore();
    const teacherRef = firestore.doc(firestore.db, "vaii_schools", teacherId);
    const teacherSnapshot = await firestore.getDoc(teacherRef);
    if (!teacherSnapshot.exists()) throw new Error("This teacher invite is invalid or has expired.");
    await firestore.updateDoc(teacherRef, { students: firestore.arrayUnion(user.uid) });
    saveTeacherId(user.uid, teacherId);
    processedInvite = inviteKey;
    const url = new URL(window.location.href);
    url.searchParams.delete("joinSchool");
    url.searchParams.delete("teacher");
    window.history.replaceState({}, "", url);
    return true;
}

async function refreshPendingAssessments() {
    const user = firebaseAuth?.currentUser;
    if (!user) {
        setPendingAssessmentCount(0);
        return 0;
    }
    const firestore = await getFirestore();
    let pendingCount = 0;
    for (const teacherId of getTeacherIds(user.uid)) {
        const teacherSnapshot = await firestore.getDoc(firestore.doc(firestore.db, "vaii_schools", teacherId));
        if (!teacherSnapshot.exists()) continue;
        const assessments = await firestore.getDocs(firestore.collection(firestore.db, "vaii_schools", teacherId, "assessments"));
        for (const assessment of assessments.docs) {
            const submission = await firestore.getDoc(firestore.doc(firestore.db, "vaii_schools", teacherId, "assessments", assessment.id, "submissions", user.uid));
            if (!submission.exists()) pendingCount++;
        }
    }
    setPendingAssessmentCount(pendingCount);
    return pendingCount;
}

export function configureVAiiSchool({ app, auth, onPendingAssessments = () => {} }) {
    if (!app || !auth || auth.app !== app) throw new Error("VAII School requires the VAII Firebase app and Auth instance.");
    firebaseApp = app;
    firebaseAuth = auth;
    pendingAssessmentHandler = onPendingAssessments;
    firestorePromise = null;
}

export async function handleSchoolAuthState(user) {
    const userId = user?.uid || null;
    if (userId !== activeUserId) {
        activeUserId = userId;
        activeAssessment = null;
        processedInvite = null;
        setPendingAssessmentCount(0);
    }
    if (!user) return;
    await joinFromInvite(user);
    await refreshPendingAssessments();
}

export function openVAiiSchool() {
    ensureOverlay();
    overlay.style.display = "flex";
    renderHome();
}

export function getPendingAssessmentCount() {
    return pendingAssessmentCount;
}
