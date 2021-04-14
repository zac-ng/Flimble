import React, { useState } from 'react';
import { InputAdornment, IconButton } from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useForm, Controller } from "react-hook-form";


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Flimble
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
    const classes = useStyles();
    const { control, register, errors, handleSubmit } = useForm({
        mode:  'onBlur', 
        reValidateMode: 'onChange',
        criteriaMode: "firstError",
        shouldFocusError: true,
        shouldUnregister: true,
      });
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const onSubmit = async data => {
    console.log("SUBMITTED DATA");
    let response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    console.log("RESPONSE RECIEVED");
    response = await response.json();
    const token = response.token;
    console.log("TOKEN: " + token);
    if(token != null){
      localStorage.setItem('accesstoken', token);
      window.location.href = '/user'
    }
    else{
      alert(JSON.stringify(response.message));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form name="registerForm" className={classes.form}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                as={TextField}
                name="username"
                variant="outlined"
                fullWidth
                id="username"
                defaultValue=""
                label="Username"
                inputRef={
                  register({
                    required: "Please enter a username",
                    maxLength: {
                      value: 16,
                      message: "Please enter a username between 4 and 16 characters"
                    },
                    minLength: {
                      value: 4,
                      message: "Please enter a username between 4 and 16 characters"
                    }
                  })
                }   
                control={control}               
              />
            {errors.username && <p>{errors.username.message}</p>}
            </Grid>
            <Grid item xs={12}>
              <Controller
                as={TextField}
                name="email"
                variant="outlined"
                fullWidth
                id="email"
                defaultValue=""
                label="Email"
                inputRef={
                  register({
                    required: "Please enter an email.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid Email Address"
                    }
                  })
                }
                autoComplete="email"   
                control={control}               
              />
              {errors.email && <p>{errors.email.message}</p>}
            </Grid>
            <Grid item xs={12}>
              <Controller
                as={TextField}
                name="password"
                variant="outlined"
                fullWidth
                id="password"
                defaultValue=""
                type={showPassword ? "text" : "password"}
                label="Password"
                inputRef={
                  register({
                    required: "Please enter a password.",
                    minLength: {
                      value: 8,
                      message: "Password must contain 8 characters."
                    },
                    maxLength: {
                      value: 64,
                      message: "Password must not be longer than 64 characters."
                    },
                    pattern: {
                      value: /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/,
                      message: "Password must contain a number and a special character."
                    }
                  })
                }
                InputProps={{ // <-- This is where the toggle button is added.
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}                 
                control={control}               
              />
              {errors.password && <p>{errors.password.message}</p>}
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit(onSubmit)}
          >
            Sign Up
          </Button>
        </form>
        <Link href="login" variant="body2" align="center">
            Already have an account? Sign in here
        </Link>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}