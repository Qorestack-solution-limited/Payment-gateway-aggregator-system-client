import { Link, useNavigate } from "react-router-dom";
import LabelInput from "../Components/LabelInput";
import Button from "../Components/Button";
import sideImage from "../Assets/reg-5.jpg";
import { Loader2, Rss } from "lucide-react";
import { useState } from "react";
import { baseUrl } from "../API/AuthApi";
const SignUp = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    const tempData = { ...data, [name]: value };
    setData(tempData);
  };
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const register = async () => {
    if (
      data.firstName &&
      data.lastName &&
      data.email &&
      data.password &&
      data.organizationName
    ) {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/auth/register`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            organizationName: data.organizationName,
          }),
        });
        const apiRespose = await res.json();
        if (res.ok) {
          console.log(apiRespose);
          setResponse("Registration Successfull, redirecting to login!");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else if (res.status == "409") {
          setResponse("Email already registered");
        } else {
          console.log("something went wrong!");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setResponse("");
        }, 4000);
      }
    } else {
      setResponse("Fill all fields before submitting!");
    }
  };

  return (
    <section className="grid md:grid-cols-2 grid-cols-1 p-4 gap-10 md:h-screen min-h-screen relative">
      <div className="overflow-y-scroll">
        <h1 className="text-2xl font-medium text-lime-300">Aggregator.</h1>
        <div className="flex flex-col p-10 gap-10">
          <div>
            <h2 className="text-center font-medium text-lg">Create Account</h2>
            <h2 className="font-semibold text-green-800 text-center">
              {response && response}
            </h2>
          </div>

          <form
            action="#"
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}>
            <LabelInput
              placeholder={"Enter your first name"}
              label={"First Name"}
              onChange={handleChange}
              name="firstName"
              value={data.firstName}
            />
            <LabelInput
              placeholder={"Enter your last name"}
              label={"last Name"}
              onChange={handleChange}
              name="lastName"
              value={data.lastName}
            />
            <LabelInput
              placeholder={"Enter organisization name"}
              label={"organization name"}
              onChange={handleChange}
              name="organizationName"
              value={data.organizationName}
            />
            <LabelInput
              placeholder={"Enter your email"}
              label={"email"}
              onChange={handleChange}
              name="email"
              value={data.email}
            />
            <LabelInput
              placeholder={"Enter your password"}
              label={"password"}
              type={"password"}
              onChange={handleChange}
              name="password"
              value={data.password}
            />
            <Button
              text={"Register"}
              style={"mt-4 bg-lime-300 text-black"}
              rightIcon={
                loading && <Loader2 className="text-white animate-spin" />
              }
              onClick={register}
            />

            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-lime-300">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div
        class="md:block hidden h-full bg-cover bg-no-repeat bg-center rounded-xl"
        style={{ backgroundImage: `url(${sideImage})` }}></div>
    </section>
  );
};
export default SignUp;
