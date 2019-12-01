import React from 'react';
import './Nav.css';
import { Link } from 'react-router-dom';


function Nav() {

    function Slide() {
        document.addEventListener("DOMContentLoaded", function() { 
            // this function runs when the DOM is ready, i.e. when the document has been parsed
            const burger = document.querySelector('.burger');
            const nav = document.querySelector('.nav-links');
            const navLinks = document.querySelectorAll('.nav-links li');

            //toggle Nav
            burger.addEventListener('click', () => {
                console.log("Burger click")
                nav.classList.toggle('burger-active');

                //animate links
                navLinks.forEach((link, index) => {
                    if(link.style.animation){
                        link.style.animation = '';
                    }
                    else{
                        link.style.animation = `navLinkFade 0.5s ease forwards ${index / 5 + 0.3}s`;
                    }
                });
                //burger animation
                burger.classList.toggle('toggle');
            });

        });
    }

  return (
        
      <div className="nav">
          
          <h4 className="logo">AWS IMAGE UPLOADER</h4>
        <div className="nav-bar">
        
            <ul className="nav-links">
                <Link to='/'>
                    <li>Home</li>
                </Link>
                <Link to='/image'>
                    <li>Image Upload</li>
                </Link>
                <Link to='/gallery'>
                    <li>Gallery</li>
                </Link>
                {/* <Link to='/write'>
                    <li>WRITE SQL</li>
                </Link> */}
            </ul>
        </div>

        {Slide()}
        <div className="burger">
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
        </div>
    </div>
  );
}


export default Nav;