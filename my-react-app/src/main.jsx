
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from './App.jsx'
import Prijava from "./Prijava";
import Registracija from "./Registracija";
import Profil from "./Profil";
import Igra from "./Igra";

const router=createBrowserRouter([
  {
    path:'/',
    element:<App/>,
  },{
    path:'/Prijava',
    element:<Prijava/>,
  },{
    path:'/Registracija',
    element:<Registracija/>,
  },{
    path:'/Profil',
    element:<Profil/>,
  },
  ,{
    path:'/Igra',
    element:<Igra/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)
