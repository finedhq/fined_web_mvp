export const Newsletter_template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f4f4;">

  <!-- Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; margin: 20px 0;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 20px 0; background-color: #007bff; color: #ffffff;">
              <h1 style="margin: 0;">Your Brand Newsletter</h1>
              <p style="margin: 0;">${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Edition</p>
            </td>
          </tr>

          <!-- Featured Article -->
          <tr>
            <td style="padding: 20px;">
              <h2>{{title}}</h2>
              <p style="text-align: justify; max-height: 48px; overflow: hidden" >
                {{content}}
              </p>
              <a href="http://localhost:5173/articles" style="display:inline-block; background:#007bff; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:5px;">Read More</a>
            </td>
          </tr>

          <!-- Topics -->
          <tr>
            <td style="padding: 20px; background-color:#f9f9f9;">
              <h3>🔥 Trending Topics</h3>
              <ul>
                <li>Budgeting Tips for July</li>
                <li>New Features in Our App</li>
                <li>Customer Success Story</li>
              </ul>
              <a href="#" style="display:inline-block; margin-top:10px; color:#007bff;">Explore All →</a>
            </td>
          </tr>

          <!-- Event -->
          <tr>
            <td style="padding: 20px;">
              <h3>📅 Upcoming Event</h3>
              <p>
                <strong>Webinar:</strong> Personal Finance 101<br/>
                <strong>Date:</strong> July 10th, 2025<br/>
              </p>
              <a href="#" style="display:inline-block; background:#28a745; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px;">Register Now</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; font-size: 12px; color: #777777; text-align: center;">
              <p>You’re receiving this email because you subscribed to FinEd.</p>
              <p>© ${new Date().getFullYear()} FinEd. All Rights Reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
