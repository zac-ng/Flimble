import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from './routes/Login';
import Register from './routes/Register';
import Home from './routes/Home';
import NotFound from './routes/NotFound';
import User from './routes/User';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact to path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/user">
            <User />
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
