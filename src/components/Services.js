import React from 'react';

export default function Services() {
    return (
        <section className='py-10 md:py-16'>
            <div className='container'>
                <div className="text-center">
                    <h2 className="text-3xl sm:text-5xl font-bold md-4">
                        What is Teach Niche?
                    </h2>
                    <p className='text-lg sm:text-2xl mb-6 md:mb-14'>
                        Teach Niche is a dedicated platform for the kendama community, enabling players to learn from experts, share their skills, and monetize their expertise.
                    </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10'>
                    <div className='card bg-base-200 transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg'>
                        <div className='card-body items-center text-center gap-4'>
                            <i className='bi bi-pencil-square text-4xl'></i>
                            <h2 className='card-title'>Expert Tutorials</h2>
                            <p>
                                Access comprehensive tutorials from top kendama players.<br className='hidden xl:inline' />
                                Enhance your skills with structured lessons.<br className='hidden xl:inline' />
                                Learn at your own pace.
                            </p>
                        </div>   
                    </div>

                    <div className='card bg-base-200 transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg'>
                        <div className='card-body items-center text-center gap-4'>
                            <i className='bi bi-coin text-4xl'></i>
                            <h2 className='card-title'>Monetize Your Skills</h2>
                            <p>
                                Create and sell your own kendama lessons.<br className='hidden xl:inline' />
                                Earn income by sharing your expertise.<br className='hidden xl:inline' />
                                Flexible pricing options.
                            </p>
                        </div>   
                    </div>                

                    <div className='card bg-base-200 transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg'>
                        <div className='card-body items-center text-center gap-4'>
                            <i className='bi bi-people text-4xl'></i>
                            <h2 className='card-title'>Community Support</h2>
                            <p>
                                Join a thriving community of kendama enthusiasts.<br className='hidden xl:inline' />
                                Participate in forums and discussions.<br className='hidden xl:inline' />
                                Collaborate and grow together.
                            </p>
                        </div>   
                    </div>

                    <div className='card bg-base-200 transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg'>
                        <div className='card-body items-center text-center gap-4'>
                            <i className='bi bi-shield-lock text-4xl'></i>
                            <h2 className='card-title'>Integrity and Fairness</h2>
                            <p>
                                Transparent commission structures.<br className='hidden xl:inline' />
                                Fair policies ensuring creators are rewarded.<br className='hidden xl:inline' />
                                Trustworthy platform operations.
                            </p>
                        </div>   
                    </div>

                    <div className='card bg-base-200 transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg'>
                        <div className='card-body items-center text-center gap-4'>
                            <i className='bi bi-tree text-4xl'></i>
                            <h2 className='card-title'>Sustainability</h2>
                            <p>
                                Building a long-term ecosystem for kendama.<br className='hidden xl:inline' />
                                Supporting continuous growth and innovation.<br className='hidden xl:inline' />
                                Ensuring a viable career path for creators.
                            </p>
                        </div>   
                    </div>

                    <div className='card bg-base-200 transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg'>
                        <div className='card-body items-center text-center gap-4'>
                            <i className='bi bi-graph-up text-4xl'></i>
                            <h2 className='card-title'>Growth and Learning</h2>
                            <p>
                                Resources for personal and communal development.<br className='hidden xl:inline' />
                                Tools to track and enhance your kendama journey.<br className='hidden xl:inline' />
                                Continuous learning opportunities.
                            </p>
                        </div>   
                    </div>
                </div>
            </div>
        </section>
    );   
}
