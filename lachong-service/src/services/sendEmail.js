const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports.sendEmail = async (to, subject, html) => {
    try {
        await resend.emails.send({
            from: "no-reply@lachong.store",
            to,
            subject,
            html,
        });
        console.log("📧 Email sent to:", to);
    } catch (error) {
        console.error("❌ Send email failed:", error);
        throw error;
    }
};
