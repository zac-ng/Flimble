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
import Cookies from 'universal-cookie';

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

export default function SignIn() {
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
    let response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    response = await response.json();
    const token = response.token;
    console.log("TOKEN: " + token);
    if(token != null){
      localStorage.setItem('accesstoken', token);
      const cookies = new Cookies();
      cookies.set ('accesstoken', token, { path: '/user/ssh' });
      window.location.href = '/user'
    }
    else{
      console.log(JSON.stringify(response.message));
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
          Sign in
        </Typography>
        <form name="loginForm" className={classes.form}>
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
                      message: "Please enter a valid username"
                    },
                    minLength: {
                      value: 4,
                      message: "Please enter a valid username"
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
                name="password"
                variant="outlined"
                fullWidth
                id="password"
                defaultValue=""
                type={showPassword ? "text" : "password"}
                label="Password"
                inputRef={
                  register({
                    pattern: {
                      value: /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,64}$/,
                      message: "Please enter a valid password"
                    }
                  })
                }
                InputProps={{
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
            Sign In
          </Button>
        </form>
        <Link href="register" variant="body2" align="center">
            Don't have an account? Register here.
          </Link>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}