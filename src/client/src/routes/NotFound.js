import React from 'react';
import error from '../static/404.jpg'

const image = {
    height:'50%',
    width:'50%',
    position: 'absolute', left: '50%', top: '40%',
    transform: 'translate(-50%, -50%)'
}

export default function NotFound(){
    
    return(
        <React.Fragment>
            <img style={image} src={error} alt="404"/>
        </React.Fragment>
    )
}