import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
});

export const sendVerificationEmail = async (email: any, code: any) => {
  const link = `https://school-consult.vercel.app/auth/verify?code=${code}`;
  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    text: `Click here to verify your email: ${link}`,
  });
};

export const sendResetPasswordEmail = async (email: any, token: any) => {
  const link = `https://school-consult.vercel.app/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: "Reset your password",
    text: `Click here to reset your password: ${link}`,
  });
};
