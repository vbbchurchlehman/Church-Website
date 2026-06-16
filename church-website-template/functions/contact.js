import { Resend } from 'resend';

export async function onRequestPost(context) {
  const formData = await context.request.formData();

  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  const resend = new Resend(context.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'website@vbbchurchlehman.com',
      to: 'vbbchurch@gmail.com',
      subject: `Website Contact Form - ${name}`,
      html: `
        <h2>New Website Message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  catch (error) {
    return new Response(
      JSON.stringify({ success: false, error }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}