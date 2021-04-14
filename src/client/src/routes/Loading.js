import React, { useEffect } from 'react';
import '../static/loading.css';


export default function Loading(){

    return(
        <React.Fragment>
            <div className="loading" delay-hide="50000"></div>
        </React.Fragment>
    )
}