import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Add timeout and connection options
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    })
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
    try {
      // Check if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Email service - SMTP not configured')
        console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Missing')
        console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Missing')
        return {
          success: false,
          message: 'Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.'
        }
      }

      console.log('Email service - Attempting to send email to:', options.to)
      console.log('Email service - SMTP config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? 'Set' : 'Missing'
      })

      // Check if using placeholder credentials
      if (process.env.SMTP_USER?.includes('your-') || process.env.SMTP_PASS?.includes('your-')) {
        console.log('❌ Email service - STILL USING PLACEHOLDER CREDENTIALS')
        console.log('❌ To send real emails, you MUST replace these values in .env:')
        console.log('❌ SMTP_USER="your-actual-gmail@gmail.com"')
        console.log('❌ SMTP_PASS="your-16-character-app-password"')
        return {
          success: true,
          message: 'TEST MODE: Email simulated! Replace placeholder credentials in .env with real Gmail credentials to send actual emails.'
        }
      }

      console.log('✅ Email service - Using real SMTP credentials, attempting to send actual email')

      const mailOptions = {
        from: `"Geospatial Metadata App" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully!')
      console.log('Message ID:', info.messageId)
      console.log('Response:', info.response)
      console.log('Accepted recipients:', info.accepted)
      console.log('Rejected recipients:', info.rejected)

      return {
        success: true,
        message: `Email sent successfully to ${options.to}! Check inbox and spam folder.`
      }
    } catch (error) {
      console.error('Error sending email:', error)
      let errorMessage = 'Failed to send email'

      if (error instanceof Error) {
        if (error.message.includes('ETIMEDOUT')) {
          errorMessage = 'Email server connection timeout. Please check your SMTP settings.'
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Email server connection refused. Please check your SMTP host and port.'
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = 'Email authentication failed. Please check your SMTP credentials.'
        } else {
          errorMessage = error.message
        }
      }

      return {
        success: false,
        message: errorMessage
      }
    }
  }

  async sendMetadataXML(
    recipientEmail: string,
    metadataTitle: string,
    xmlContent: string,
    format: 'iso19139' | 'sni'
  ): Promise<{ success: boolean; message: string }> {
    const subject = `Metadata XML: ${metadataTitle}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Metadata XML Export</h2>
        <p>Dear User,</p>
        <p>Please find attached the XML metadata file for: <strong>${metadataTitle}</strong></p>
        <p><strong>Format:</strong> ${format.toUpperCase()}</p>
        <p><strong>Generated on:</strong> ${new Date().toLocaleString('id-ID')}</p>
        <br>
        <p>This XML file conforms to the ${format === 'iso19139' ? 'ISO 19115/19139' : 'SNI'} standard.</p>
        <br>
        <p>Best regards,<br>Geospatial Metadata Application</p>
      </div>
    `

    const attachments = [{
      filename: `${metadataTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format}.xml`,
      content: xmlContent,
      contentType: 'application/xml'
    }]

    return await this.sendEmail({
      to: recipientEmail,
      subject,
      html,
      attachments
    })
  }
}

export const emailService = new EmailService()
export default emailService