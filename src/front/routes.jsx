import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout.jsx";
import { Error404 } from "./pages/Error404.jsx";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { ProfileSettings } from "./pages/ProfileSettings.jsx";
import { Trips } from "./pages/Trips.jsx";
import { TripDetails } from "./pages/TripDetails.jsx";
import { TripUsers } from "./pages/TripUsers.jsx";
import { TripUserDetails } from "./pages/TripUserDetails.jsx";
import { Activities } from "./pages/Activities.jsx";
import { ActivityDetails } from "./pages/ActivityDetails.jsx";
import { ActivityStories } from "./pages/ActivityStories.jsx";
import { ActivityStoryDetails } from "./pages/ActivityStoryDetails.jsx";
import Contact from "./pages/Contact.jsx";


/* 
CreateRoutesFromElements function allows you to build route elements declaratively.
Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
Root, on the contrary, create a sister Route, if you have doubts, try it!
Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.
*/
export const router = createBrowserRouter (
    createRoutesFromElements (
      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<Error404/>} >
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users/:user_id" element={<ProfileSettings />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:trip_id" element={<TripDetails />} />
        <Route path="/trips/:trip_id/users" element={<TripUsers />} />
        <Route path="/trips/:trip_id/users/:user_id" element={<TripUserDetails />} />
        <Route path="/trips/:trip_id/activities" element={<Activities />} />
        <Route path="/trips/:trip_id/activities/:activity_id" element={<ActivityDetails />} />
        <Route path="/trips/:trip_id/activities/:activity_id/stories" element={<ActivityStories />} />
        <Route path="/trips/:trip_id/activities/:activity_id/stories/:story_id" element={<ActivityStoryDetails />} />
      </Route>
      
    )
);
