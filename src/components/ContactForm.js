import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    emailType: "",
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle the form submission here (e.g., send an email using EmailJS, etc.)
    alert("Your message has been sent!");
    // Reset form fields after submission
    setFormData({
      emailType: "",
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <section className="py-10 px-10 lg:px-16 bg-red-violet bg-opacity-20">
      <h1 className="text-3xl font-bold mb-5">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label className="text-gray-300 mb-2" htmlFor="emailType">
            Select Email Type
          </label>
          <select
            id="emailType"
            name="emailType"
            value={formData.emailType}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-gray-700 text-gray-200"
          >
            <option value="">-- Choose an option --</option>
            <option value="officers@hhsfbla.com">General Questions</option>
            <option value="comps@hhsfbla.com">Competition Related Questions</option>
            <option value="cs@hhsfbla.com">Community Service Project</option>
            <option value="sv@hhsfbla.com">Software Ventures Project</option>
            <option value="pwb@hhsfbla.com">Partnership with Business Project</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-300 mb-2" htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-gray-700 text-gray-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-300 mb-2" htmlFor="email">
            Your Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-gray-700 text-gray-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-300 mb-2" htmlFor="message">
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="p-3 rounded-lg bg-gray-700 text-gray-200"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-red-violet text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}