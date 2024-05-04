import React from 'react';

const THEMES = [
    "light",
    "dark",
  ]

export default function Header() {
    
    const [theme, setTheme] = React.useState('light');

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme])

    const handleThemeChange = (e) => {
        var val = e.target.getAttribute('data-set-theme');
        setTheme(val);
    }

    return (
        <header className='sticky top-0 z-50 py-2 bg-base-100'>
            <div className='container'>
                <div className="navbar px-0">
                    <div className="navbar-start">
                        <div className="dropdown">
                            <label tabIndex={0} role="button" className="btn btn-primary btn-circle lg:hidden mr-1">
                                <i className="bi bi-list text-2xl"></i>
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-1 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
                                <li><a href="#!">Home</a></li>
                                <li><a href="#!">Lessons</a></li>
                                <li><a href="#!">About</a></li>
                                <li><a href="#!">Reviews</a></li>
                                <li><a href="#!">FAQ</a></li>
                            </ul>
                        </div>
                        <a className="btn btn-ghost normal-case text-2xl">Teach Niche</a>
                    </div>
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal p-0 font-medium">
                        <li>
                            <a href="#!">Home</a></li>
                            <li><a href="#!">Lessons</a></li>
                            <li><a href="#!">About</a></li>
                            <li><a href="#!">Reviews</a></li>
                            <li><a href="#!">FAQ</a></li>
                        </ul>
                    </div>
                    <div className="navbar-end">
                        <a className="btn">Get Started</a>
                        <div className='dropdown dropdown-end'>
                         <label tabIndex={0} className='btn'>{THEMES.length} Themes</label>
                         <ul tabIndex={0} className="menu menu-compact dropdown-content mt-1 p-2 shadow bg-base-200 rounded-box w-25 max-h-96 overflow-y-auto">
                            {THEMES.map((theme, i) => <li key={theme+i}><button data-set-theme={theme} onClick={handleThemeChange}>{theme}</button></li>)}
                         </ul>
                         </div>
                    </div>
                </div>
            </div>
        </header>
    );
}