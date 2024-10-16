import React, { useState } from "react";

/**
 * ProfileForm Component
 *
 * Renders a form for updating user profile information.
 *
 * @param {Object} props - The component props.
 * @returns {JSX.Element} The Profile Form.
 */
export default function ProfileForm({ profileData, onUpdate }) {
  const [formData, setFormData] = useState(profileData);

  /**
   * Handles input changes in the form.
   *
   * @param {Event} e - The change event.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission for updating profile.
   *
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control">
        <label className="label" htmlFor="fullName">
          <span className="label-text">Full Name</span>
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          placeholder="Full Name"
          className="input input-bordered"
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>
      <div className="form-control mt-4">
        <label className="label" htmlFor="socialMediaTag">
          <span className="label-text">Social Media Tag</span>
        </label>
        <input
          type="text"
          id="socialMediaTag"
          name="socialMediaTag"
          placeholder="Social Media Tag"
          className="input input-bordered"
          value={formData.socialMediaTag}
          onChange={handleChange}
        />
      </div>
      <div className="form-control mt-4">
        <label className="label" htmlFor="bio">
          <span className="label-text">Bio</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          placeholder="Your bio"
          className="textarea textarea-bordered h-24"
          value={formData.bio}
          onChange={handleChange}
        >
        </textarea>
      </div>
      <div className="form-control mt-6">
        <button className="btn btn-primary" type="submit">
          Save Profile
        </button>
      </div>
    </form>
  );
}
