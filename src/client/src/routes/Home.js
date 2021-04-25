import React from 'react';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Particles from "react-tsparticles";
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles';

const mainTitle ={
  marginTop:'15%',
  textAlign:'center',
  fontSize:'500%',
}

const subTitle = {
  textAlign:'center',
  fontSize:'150%',
}

const theme = createMuiTheme({
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
}) 



export default function Home() {
      return (
        <React.Fragment>
          <Particles
          options={{
            backgroundMode: {
              enable: true,
              zIndex: -1
            },
            particles: {
              number: {
                value: 20,
                density: {
                  enable: true,
                  value_area: 800
                }
              },
              color: {
                value: ["#2EB67D", "#ECB22E", "#E01E5B", "#36C5F0"]
              },
              shape: {
                type: ["circle"],
                stroke: {
                  width: 0,
                  color: "#fff"
                },
                polygon: {
                  nb_sides: 5
                },
                image: {
                  src: "https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png",
                  width: 100,
                  height: 100
                }
              },
              opacity: {
                value: 1,
                random: false,
                anim: {
                  enable: false,
                  speed: 1,
                  opacity_min: 0.1,
                  sync: false
                }
              },
              size: {
                value: 8,
                random: true,
                anim: {
                  enable: false,
                  speed: 10,
                  size_min: 10,
                  sync: false
                }
              },
              line_linked: {
                enable: false,
                distance: 150,
                color: "#808080",
                opacity: 0.4,
                width: 1
              },
              move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                  enable: false,
                  rotateX: 600,
                  rotateY: 1200
                }
              }
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: {
                  enable: true,
                  mode: "grab"
                },
                onclick: {
                  enable: true,
                  mode: "push"
                },
                resize: true
              },
              modes: {
                grab: {
                  distance: 140,
                  line_linked: {
                    opacity: 0  //Changed opacity to 0 to prevent lines
                  }
                },
                bubble: {
                  distance: 400,
                  size: 40,
                  duration: 2,
                  opacity: 8,
                  speed: 3
                },
                repulse: {
                  distance: 200,
                  duration: 0.4
                },
                push: {
                  particles_nb: 4
                },
                remove: {
                  particles_nb: 2
                }
              }
            },
            retina_detect: true,
            fps_limit: 60,
          }}
        />
        <Box>
          <Fade in timeout={1500}>
            <h1 style={mainTitle}>Flimble</h1>
          </Fade>
          <Fade in timeout={{enter:6000}}>
            <Box>
              <h2 style={subTitle}>Your browser-based Ubuntu Terminal</h2>
            </Box>            
          </Fade>
          <Fade in timeout={{enter:7000}}>
            <Box textAlign='center'>
              <ThemeProvider theme={theme}>
                <Button variant='contained' color="primary" href='/login'>
                  Get Started
                </Button>
              </ThemeProvider>
            </Box>
          </Fade>
        </Box>
      </React.Fragment>
    )
  }