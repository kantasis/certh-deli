import React, { useState, useRef, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { NavigateFunction, useNavigate } from 'react-router-dom';
import IUser from "../types/user.type";
import { register } from "../services/auth.service";

// Generate random CAPTCHA string
const generateCaptcha = () => {
   const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
   let text = "";
   for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return text;
};

// Draw CAPTCHA on canvas
const drawCaptcha = (canvasRef: React.RefObject<HTMLCanvasElement>, text: string) => {
   const canvas = canvasRef.current;
   if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.font = "24px Arial";
         ctx.fillStyle = "#000";
         ctx.fillText(text, 10, 30);
      }
   }
};

const Register: React.FC = () => {
   const navigate = useNavigate();
   const [successful, setSuccessful] = useState(false);
   const [message, setMessage] = useState("");
   const [loading, setLoading] = useState(false);

   const [captchaText, setCaptchaText] = useState(generateCaptcha());
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      drawCaptcha(canvasRef, captchaText);
   }, [captchaText]);

   const refreshCaptcha = () => {
      const newText = generateCaptcha();
      setCaptchaText(newText);
   };

   const initialValues = {
      name: "",
      surname: "",
      username: "",  // We'll automatically set this to email.
      email: "",
      password: "",
      confirmPassword: "",
      captchaInput: "",
   };

   const validationSchema = Yup.object().shape({
      name: Yup.string().required("Name is required!"),
      surname: Yup.string().required("Surname is required!"),
      username: Yup.string().required("This field is required!"),
      email: Yup.string()
         .email("This is not a valid email.")
         .required("This field is required!"),
      password: Yup.string()
         .min(6, "The password must be at least 6 characters.")
         .max(40, "The password must be at most 40 characters.")
         .required("This field is required!"),
      confirmPassword: Yup.string()
         .required("Please confirm your password")
         .oneOf([Yup.ref("password")], "Passwords must match"),
      captchaInput: Yup.string()
         .required("Please enter the CAPTCHA")
         .test("match-captcha", "CAPTCHA does not match", function (value) {
            return value?.toLowerCase() === captchaText.toLowerCase();
         }),
   });

   const handleRegister = (formValue: typeof initialValues) => {

      const { username, email, password, name, surname } = formValue;
      setLoading(true);

      register(username, email, password, name, surname)
         .then(
            (response) => {
               const msg = response?.data?.message || "Registered successfully!";
               setMessage(msg);
               setSuccessful(true);
               setLoading(false);
               setTimeout(() => {
                  navigate("/login");
               }, 2000);

            },
            (error) => {
               const resMessage =
                  (error.response?.data?.message) ||
                  error.message ||
                  error.toString();

               setMessage(resMessage);
               setSuccessful(false);
               setLoading(false);
               refreshCaptcha(); // Refresh CAPTCHA on error
            }
         );
   };

   return (
      <div className="col-md-12" style={{ paddingTop: "40px", paddingBottom: "48px" }}>
         <div className="card container" style={{ maxWidth: "560px", borderRadius: "20px", padding: "36px", border: "1px solid var(--border, #e5e7eb)", boxShadow: "0 8px 32px rgba(2,6,23,0.08)" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#e8f2f6", color: "var(--brand-dark, #185569)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
               </svg>
            </div>
            <h2 style={{ textAlign: "center", fontWeight: 800, fontSize: "22px", marginBottom: "4px", color: "var(--text, #0f172a)" }}>Create Account</h2>
            <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted, #475569)", marginBottom: "28px" }}>Register to access the DELI platform</p>
            <Formik
               initialValues={initialValues}
               validationSchema={validationSchema}
               onSubmit={handleRegister}
            >
               {({ values, setFieldValue }) => {
                  // Automatically set username as email (cannot be edited by user)
                  useEffect(() => {
                     if (values.email) {
                        setFieldValue("username", values.email);
                     }
                  }, [values.email, setFieldValue]);

                  return (
                     <Form>
                        {!successful && (
                           <>
                              <div className="row">
                                 <div className="col-md-6 form-group">
                                    <label htmlFor="name">Name</label>
                                    <Field name="name" type="text" className="form-control" />
                                    <ErrorMessage name="name" component="div" className="alert alert-danger" />
                                 </div>

                                 <div className="col-md-6 form-group">
                                    <label htmlFor="surname">Surname</label>
                                    <Field name="surname" type="text" className="form-control" />
                                    <ErrorMessage name="surname" component="div" className="alert alert-danger" />
                                 </div>
                              </div>

                              <div className="row">
                                 <div className="col-md-6 form-group">
                                    {/* Hidden username field */}
                                    <Field
                                       name="username"
                                       type="text"
                                       className="form-control"
                                       hidden={true}
                                    />
                                 </div>
                              </div>

                              <div className="row">
                                 <div className="col-md-6 form-group">
                                    <label htmlFor="password">Password</label>
                                    <Field name="password" type="password" className="form-control" />
                                    <ErrorMessage name="password" component="div" className="alert alert-danger" />
                                 </div>

                                 <div className="col-md-6 form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <Field name="confirmPassword" type="password" className="form-control" />
                                    <ErrorMessage name="confirmPassword" component="div" className="alert alert-danger" />
                                 </div>
                              </div>

                              <div className="col-md-6 form-group">
                                 <label htmlFor="email">Email</label>
                                 <Field name="email" type="email" className="form-control" />
                                 <ErrorMessage name="email" component="div" className="alert alert-danger" />
                              </div>

                              <div className="form-group">
                                 <label htmlFor="captchaInput">Enter the text below</label>
                                 <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <canvas
                                       ref={canvasRef}
                                       width={120}
                                       height={40}
                                       style={{ border: "1px solid var(--border, #e5e7eb)", borderRadius: "8px" }}
                                    />
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={refreshCaptcha}>
                                       Refresh
                                    </button>
                                 </div>
                                 <Field name="captchaInput" type="text" className="form-control mt-2" />
                                 <ErrorMessage name="captchaInput" component="div" className="alert alert-danger" />
                              </div>
                           </>
                        )}

                        {message && (
                           <div className="form-group">
                              <div
                                 className={successful ? "alert alert-success" : "alert alert-danger"}
                                 role="alert"
                              >
                                 {message}
                              </div>
                           </div>
                        )}

                        {!successful && (
                           <div className="d-flex justify-content-center mt-3">
                              <button
                                 type="submit"
                                 className="btn btn-primary btn-block"
                                 disabled={loading}
                              >
                                 {loading ? "Signing Up..." : "Sign Up"}
                              </button>
                           </div>
                        )}
                     </Form>
                  );
               }}
            </Formik>
         </div>
      </div>
   );

};

export default Register;
