import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Profile() {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDescription, setLessonDescription] = useState('');
    const [lessonCost, setLessonCost] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');

    const handleProfilePictureChange = (e) => {
        setProfilePicture(URL.createObjectURL(e.target.files[0]));
    };

    return (
        <div className="container mx-auto">
            <Header />
            <div className="flex flex-col justify-center items-center min-h-screen py-10">
                <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6 mb-10">
                    <h2 className="card-title text-3xl mb-4">Profile</h2>
                    <form>
                        <div className="form-control mb-4">
                            <label className="label" htmlFor="name">
                                <span className="label-text">Name</span>
                            </label>
                            <input 
                                type="text" 
                                id="name" 
                                placeholder="Name" 
                                className="input input-bordered" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-control mb-4">
                            <label className="label" htmlFor="bio">
                                <span className="label-text">Bio</span>
                            </label>
                            <textarea 
                                id="bio" 
                                placeholder="Your bio" 
                                className="textarea textarea-bordered" 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="form-control mb-4">
                            <label className="label" htmlFor="profilePicture">
                                <span className="label-text">Profile Picture</span>
                            </label>
                            <input 
                                type="file" 
                                id="profilePicture" 
                                className="input input-bordered" 
                                onChange={handleProfilePictureChange}
                            />
                            {profilePicture && (
                                <div className="mt-4">
                                    <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full mx-auto" />
                                </div>
                            )}
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary">Save Profile</button>
                        </div>
                    </form>
                </div>

                <div className="card w-full max-w-2xl shadow-2xl bg-base-100 p-6">
                    <h2 className="card-title text-3xl mb-4">Create New Lesson</h2>
                    <form>
                        <div className="form-control mb-4">
                            <label className="label" htmlFor="lessonTitle">
                                <span className="label-text">Title</span>
                            </label>
                            <input 
                                type="text" 
                                id="lessonTitle" 
                                placeholder="Title" 
                                className="input input-bordered" 
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-control mb-4">
                            <label className="label" htmlFor="lessonDescription">
                                <span className="label-text">Description</span>
                            </label>
                            <textarea 
                                id="lessonDescription" 
                                placeholder="Description" 
                                className="textarea textarea-bordered" 
                                value={lessonDescription}
                                onChange={(e) => setLessonDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="form-control mb-4">
                            <label className="label" htmlFor="lessonCost">
                                <span className="label-text">Cost</span>
                            </label>
                            <input 
                                type="text" 
                                id="lessonCost" 
                                placeholder="Cost" 
                                className="input input-bordered" 
                                value={lessonCost}
                                onChange={(e) => setLessonCost(e.target.value)}
                            />
                        </div>
                        <div className="form-control mb-4">
                            <label className="label" htmlFor="youtubeLink">
                                <span className="label-text">Private YouTube Link</span>
                            </label>
                            <input 
                                type="text" 
                                id="youtubeLink" 
                                placeholder="YouTube Link" 
                                className="input input-bordered" 
                                value={youtubeLink}
                                onChange={(e) => setYoutubeLink(e.target.value)}
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary">Create Lesson</button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
