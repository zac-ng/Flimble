import React, { useEffect, useState } from 'react';
import Loading from './Loading'
import SSH from './SSH'

export default function User(){

    async function checkRefreshToken() {
        const result = await (
          await fetch('http://localhost:5000/api/refresh_token', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
            }
          })).json();
        console.log("Access token: " + result.accesstoken);
        localStorage.setItem('accesstoken', result.accesstoken);
      }
      
    //  Onload Verify User
    // const [showTerminal, setShowTerminal] = useState(false);
    async function authenticate() {
        let token = localStorage.getItem('accesstoken');
        console.log("Token: " + token);
        let result;
        if(token)
        {
            result = await fetch('http://localhost:5000/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: 'Bearer '+ token,
                }
            })
            result = await result.json(); 
            console.log(result.code);
            if(result.code > 0)
            {
                window.location.href = '/bob';
                return;
            }
        }
        console.log("Bad access token, requesting a new access token from the server.");
        await checkRefreshToken();
        //      Attempt to send authenticate with new access token        //

        token = localStorage.getItem('accesstoken');
        console.log("New Access Token: " + token);
        result = await fetch('http://localhost:5000/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: 'Bearer '+ token,
            }
        })
        result = await result.json(); 

        //      If null refresh token redirect, otherwise render screen     //

        console.log("CODE: " + result.code);

        if(result.code < 0) 
            window.location.href = '/login';
        else
            window.location.href = '/bob';
    }

    useEffect( async () => {
        authenticate();
        window.addEventListener('pageshow', (event) => {        //      Allows authentication even if user presses back
            authenticate();
        });
    }, [])

    //      Render loading screen while we are waiting for connection.  When a connection is made render terminal.      //

    return(
        <React.Fragment>
            <Loading></Loading>
        </React.Fragment>
    )
}