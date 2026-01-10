import React from 'react';

function Home(){
    return(
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded w-25 text-center">
                <h2>Welcome to the Home Page!</h2>
                <p>You have successfully logged in.</p>
            </div>
        </div>
    );
}

export default Home;