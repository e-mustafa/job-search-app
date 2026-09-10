import { ENV } from '../../config/env.config';
import { sendEmail } from './send-email';

const appName = ENV.appName;

// Define interface for email template parameters
export interface ApplicationRejectedEmailOptions {
	email: string;
	name: string;
	jobTitle?: string;
	language?: 'ar' | 'en';
}

/**
 * Sends an email notification to the applicant informing them that their job application was not selected.
 *
 * @param options Object containing email details including recipient email, name, job title, and preferred language.
 */
export const applicationRejectedEmail = async ({
	email,
	name,
	jobTitle,
	language = 'en',
}: ApplicationRejectedEmailOptions): Promise<unknown> => {
	// Arabic Dynamic Subject & Dynamic Job Text
	const jobText_ar = jobTitle ? `لوظيفة (${jobTitle})` : '';
	const emailTitle_ar = `تحديث بشأن طلب التقديم الخاص بك في ${appName}`;

	// English Dynamic Subject & Dynamic Job Text
	const jobText_en = jobTitle ? `for the position of (${jobTitle})` : '';
	const emailTitle_en = `Update regarding your application at ${appName}`;

	// Arabic HTML Template
	const emailTemplate_ar = `
   <!DOCTYPE html>
   <html lang="ar" dir="rtl">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>تحديث بشأن طلب التوظيف</title>
   </head>
   <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
     
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 30px 0;">
       <tr>
         <td align="center">
           
           <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
             
             <!-- Header Section -->
             <tr>
               <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 40px 30px; text-align: center;">
                 <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">
                   ${appName}
                 </h1>
               </td>
             </tr>
             
             <!-- Body Section -->
             <tr>
               <td style="padding: 40px 35px;">
                 
                 <!-- Status Badge -->
                 <div style="text-align: center; margin-bottom: 25px;">
                   <span style="display: inline-block; background-color: #edf2f7; color: #4a5568; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px;">
                     تحديث حالة الطلب
                   </span>
                 </div>

                 <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 20px; font-size: 22px; font-weight: 700; text-align: center;">
                   مرحباً ${name || 'عزيزنا المتقدم'}،
                 </h2>

                 <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
                   نشكرك جزيل الشكر على اهتمامك بالانضمام إلى فريقنا وعلى الوقت والمجهود الذي بذلته في التقديم ${jobText_ar} في <strong>${appName}</strong>.
                 </p>

                 <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 30px;">
                   بعد مراجعة وتقييم جميع الطلبات بعناية فائقة، نود إبلاغك بأنه قد تم اختيار مرشح آخر تتوافق خبراته بشكل أقرب مع متطلبات الوظيفة الحالية، ولن نتمكن من المضي قدماً في طلبك لهذه الفرصة.
                 </p>

                 <!-- Future Opportunities Card -->
                 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
                   <tr>
                     <td style="padding: 24px;">
                       <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
                         💡 الفرص المستقبلية:
                       </h3>
                       <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                         لقد أثار إعجابنا مؤهلك وسيرتك الذاتية. سنحتفظ ببياناتك في قاعدة بياناتنا وسنقوم بالتواصل معك في حال ظهور أي فرصة عمل جديدة تتناسب مع خبراتك ومهاراتك.
                       </p>
                     </td>
                   </tr>
                 </table>

                 <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                   نتمنى لك كل التوفيق والنجاح في مسيرتك المهنية والبحث عن فرصتك القادمة.
                 </p>

               </td>
             </tr>

             <!-- Footer Section -->
             <tr>
               <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #edf2f7;">
                 <p style="color: #a0aec0; font-size: 12px; margin: 0; line-height: 1.5;">
                   تم إرسال هذا البريد إلكترونياً بخصوص طلب التوظيف الخاص بك في ${appName}.
                 </p>
                 <p style="color: #cbd5e1; font-size: 12px; margin: 8px 0 0 0;">
                   &copy; ${new Date().getFullYear()} ${appName}. جميع الحقوق محفوظة.
                 </p>
               </td>
             </tr>

           </table>

         </td>
       </tr>
     </table>

   </body>
   </html>
   `;

	// English HTML Template
	const emailTemplate_en = `
   <!DOCTYPE html>
   <html lang="en" dir="ltr">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Application Status Update</title>
   </head>
   <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: ltr; text-align: left;">
     
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 30px 0;">
       <tr>
         <td align="center">
           
           <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
             
             <!-- Header Section -->
             <tr>
               <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 40px 30px; text-align: center;">
                 <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">
                   ${appName}
                 </h1>
               </td>
             </tr>
             
             <!-- Body Section -->
             <tr>
               <td style="padding: 40px 35px;">
                 
                 <!-- Status Badge -->
                 <div style="text-align: center; margin-bottom: 25px;">
                   <span style="display: inline-block; background-color: #edf2f7; color: #4a5568; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px;">
                     Application Update
                   </span>
                 </div>

                 <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 20px; font-size: 22px; font-weight: 700; text-align: center;">
                   Hello ${name || 'Dear Applicant'},
                 </h2>

                 <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
                   Thank you very much for your interest in joining our team and for taking the time to apply ${jobText_en} at <strong>${appName}</strong>.
                 </p>

                 <p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin-bottom: 30px;">
                   After careful consideration of all applications, we regret to inform you that we have decided to move forward with another candidate whose qualifications more closely match our current requirements for this role.
                 </p>

                 <!-- Future Opportunities Card -->
                 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
                   <tr>
                     <td style="padding: 24px;">
                       <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
                         💡 Future Opportunities:
                       </h3>
                       <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                         We were impressed by your background and experience. We will keep your details in our talent pipeline and may reach out to you if a suitable position opens up in the future.
                       </p>
                     </td>
                   </tr>
                 </table>

                 <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                   We sincerely appreciate your interest in ${appName} and wish you all the best in your professional journey and career endeavors.
                 </p>

               </td>
             </tr>

             <!-- Footer Section -->
             <tr>
               <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #edf2f7;">
                 <p style="color: #a0aec0; font-size: 12px; margin: 0; line-height: 1.5;">
                   This email was sent regarding your application at ${appName}.
                 </p>
                 <p style="color: #cbd5e1; font-size: 12px; margin: 8px 0 0 0;">
                   &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
                 </p>
               </td>
             </tr>

           </table>

         </td>
       </tr>
     </table>

   </body>
   </html>
   `;

	// Send email using the configured sendEmail service
	return await sendEmail({
		to: email,
		subject: language === 'ar' ? emailTitle_ar : emailTitle_en,
		html: language === 'ar' ? emailTemplate_ar : emailTemplate_en,
	});
};
