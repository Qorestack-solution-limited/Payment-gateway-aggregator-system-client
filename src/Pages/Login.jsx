import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { baseUrl } from "../API/AuthApi";
import LabelInput from "../Components/LabelInput";
import Button from "../Components/Button";
import sideImage from "../Assets/reg-5.jpg";
import { useState } from "react";
const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");
  const login = async () => {
    if (email && password) {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/auth/login`, {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
          method: "POST",
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("payToken", data.data.accessToken);
          localStorage.setItem("payUser", data.data);
          setResponse("login successfull, redirecting...");
          navigate("/dashboard");
        } else if (res.status === "401") {
          setResponse("Incorrect email or passsword!");
        } else {
          setResponse("Error, Please try again later!");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <section class="grid md:grid-cols-2 grid-cols-1 p-4 gap-10 min-h-screen">
      <div class="">
        <h1 class="text-2xl font-medium text-lime-300">Aggregator.</h1>
        <div className="flex flex-col p-10 gap-10">
          <div>
            <h2 class="text-center font-medium text-lg">
              Nice to have you back.
            </h2>
            <h3 class="text-center font-light text-sm tracking-wide">
              Enter your details to login to your account.
            </h3>
          </div>

          <form
            action="#"
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
            }}>
            <LabelInput
              placeholder={"Enter your email"}
              label={"email"}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <LabelInput
              placeholder={"Enter your password"}
              label={"password"}
              type={"password"}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            {response && <span className="font-semibold">{response}</span>}
            <Button
              text={"Sign in"}
              style={"mt-4 bg-lime-300 text-black"}
              onClick={login}
              rightIcon={
                loading && <Loader2 className="text-white animate-spin" />
              }
            />

            <p className="text-sm text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-lime-300">
                Sign Up
              </Link>
            </p>
            <Link to="/forget-password" className="text-sm self-end underline">
              Forget Password
            </Link>
          </form>
        </div>
      </div>
      <div
        class="md:block hidden h-full bg-cover bg-no-repeat bg-center rounded-xl"
        style={{ backgroundImage: `url(${sideImage})` }}></div>
    </section>
  );
};
export default Login;
