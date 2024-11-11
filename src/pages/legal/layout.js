import React from "react";
/**
 * Legal Component
 *
 * Renders the Legal page with terms of use, privacy policy, and cookie policy in a single text box.
 *
 * @returns {JSX.Element} The Legal page.
 */
const Legal = () => {
  const legalContent = [
    {
      title: "Terms of Use",
      content: [
        "Welcome to Teach Niche. By accessing and using this website, you agree to comply with and be bound by the following terms and conditions of use. Please review these terms carefully before using our website.",
        "The content of this website is for general information and use only. It is subject to change without notice. Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.",
        "Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.",
        "This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.",
        "Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.",
      ],
    },
    {
      title: "Privacy Policy",
      content: [
        "At Teach Niche, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.",
        "1. Information We Collect: We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise contact us. This includes your name, email address, password, and any other data you provide. We also collect generated content (any content you create or generate while using our services) and use cookies to enhance your experience on our website.",
        "2. How We Use Your Information: We may use your information to: Provide, operate, and maintain our website; Improve, personalize, and expand our website; Understand and analyze how you use our website; Develop new products, services, features, and functionality; Communicate with you, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.",
        "3. Sharing Your Information: We do not sell or rent your personal information to third parties. We may share information we have collected about you in certain situations, such as with service providers who assist us in operating our website, when required by law, or to protect our rights and the rights of others.",
        "4. Data Security: We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.",
        "5. Your Rights: You have the right to access, rectify, erase, and object to the processing of your personal data, under certain conditions. If you believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.",
        "6. Changes to This Privacy Policy: We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.",
        "7. Contact Us: If you have any questions or concerns about this Privacy Policy, please contact us at: info@teach-niche.com",
        "By using our website, you consent to our Privacy Policy and agree to its terms.",
      ],
    },
    {
      title: "Cookie Policy",
      content: [
        "Teach Niche uses cookies on our website. By using the Service, you consent to the use of cookies. Our Cookies Policy explains what cookies are, how we use cookies, how third-parties we may partner with may use cookies on the Service, your choices regarding cookies and further information about cookies.",
        "Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.",
        "When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes: to enable certain functions of the Service, to provide analytics, to store your preferences, to enable advertisements delivery, including behavioral advertising.",
        "We use both session and persistent cookies on the Service and we use different types of cookies to run the Service: Essential cookies. We may use essential cookies to authenticate users and prevent fraudulent use of user accounts.",
        "In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on. If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser.",
      ],
    },
  ];

  return (
    <div className="bg-base-200 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6">Legal Information</h2>
            {legalContent.map((section, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-2xl font-bold mb-4">{section.title}</h3>
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-lg mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Legal;
