import React, { useRef, useState } from "react";

import Editor from "@monaco-editor/react";
import { FillSpinner as Loader } from "react-spinners-kit";
import Toggle from "react-toggle";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Submit from "../submit/submit";
import "./editor.css";

export default function(props) {
	const [theme, setTheme] = useState("dark");
	const [language, setLanguage] = useState("cpp");
	const [isEditorReady, setIsEditorReady] = useState(false);
	const [testInput, setTestInput] = useState("");
	const [testOutput, setTestOutput] = useState("");
	const [isWaiting, setIsWaiting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	let output_content = null;

	if (submitted && isWaiting) {
		output_content = (
			<div className="text-center">
				<img src={require("../../imgs/spi.svg")}></img>
			</div>
		);
	} else if (submitted && !isWaiting) {
		output_content = (
			<div className="mt-4">
				<h3>Output:</h3>
				<div className="mt-2 output-container">{testOutput}</div>
			</div>
		);
	}

	const valueGetter = useRef();

	const codechef_language_mapper = {
		cpp: "C++17",
		java: "JAVA",
		javascript: "JS",
		python: "PYTH 3.6",
		c: "C"
	};

	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	function handleEditorDidMount(_valueGetter) {
		setIsEditorReady(true);
		valueGetter.current = _valueGetter;
	}

	function handleThemeChange() {
		setTheme(theme === "light" ? "dark" : "light");
	}

	function changeLanguage(event) {
		setLanguage(event.target.value);
	}

	function handleOnRun() {
		// alert(valueGetter.current());
		// console.log(valueGetter.current(), testInput);

		setIsWaiting(true);
		setSubmitted(true);

		fetch(`https://api.codechef.com/ide/run`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: "Bearer " + props.user_session.access_token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				sourceCode: valueGetter.current(),
				language: codechef_language_mapper[language],
				input: testInput
			})
		})
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error(res.status);
				}
			})
			.then(
				result => {
					// console.log(
					// 	`https://api.codechef.com/ide/status?link=${result.result.data.link}`
					// );
					setTimeout(() => {
						fetch(
							`https://api.codechef.com/ide/status?link=${result.result.data.link}`,
							{
								method: "GET",
								headers: {
									Accept: "application/json",
									Authorization:
										"Bearer " +
										props.user_session.access_token
								}
							}
						)
							.then(res2 => {
								if (res2.ok) {
									return res2.json();
								} else {
									throw new Error(res2.status);
								}
							})
							.then(
								result2 => {
									console.log(result2);
									let compile_info =
										result2.result.data.cmpinfo;
									let stderr_info =
										result2.result.data.stderr;
									let output = result2.result.data.output;

									if (compile_info != "") {
										setTestOutput(compile_info);
									} else if (stderr_info != "") {
										setTestOutput(stderr_info);
									} else if (output != "") {
										setTestOutput(output);
									} else {
										setTestOutput(
											"Some error occured. Try again after sometime."
										);
									}

									setIsWaiting(false);
									setSubmitted(true);
								},
								error2 => {
									console.log(error2.message);
									if (error2.message == 401) {
										props.logout();
									}
								}
							);
					}, 6000);
				},
				error => {
					console.log(error.message);
					if (error.message == 401) {
						props.logout();
					}
				}
			);
	}

	return (
		<>
			<div className="editor-container">
				<div className="row options-container">
					<div className="col-md-6">
						<div className="test-container">
							<Button
								onClick={handleShow}
								className="btn btn-success mr-5"
								disabled={!isEditorReady}
							>
								Run <i className="fas fa-play"></i>
							</Button>

							<Modal show={show} onHide={handleClose}>
								<Modal.Header closeButton>
									<Modal.Title>Test run</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<div
										className="alert alert-primary"
										role="alert"
									>
										Check your code with custom testcases.
									</div>
									<div className="form-group">
										<div className="form-group">
											<label htmlFor="run-input">
												Input
											</label>
											<textarea
												className="form-control"
												id="run-input"
												rows="3"
												value={testInput}
												onChange={event =>
													setTestInput(
														event.target.value
													)
												}
											></textarea>
										</div>
									</div>
									<div className="text-left">
										<button
											className="btn btn-primary"
											onClick={handleOnRun}
										>
											Test{" "}
											<i className="fas fa-clipboard-list"></i>
										</button>
									</div>
									{output_content}
								</Modal.Body>
								<Modal.Footer>
									<Button
										variant="secondary"
										onClick={handleClose}
									>
										Close
									</Button>
								</Modal.Footer>
							</Modal>
							<Submit disabled={!isEditorReady}></Submit>
						</div>
					</div>
					<div className="col-md-6 text-right">
						<div className="config-container">
							<div className="theme-container">
								<label
									className="theme-label"
									htmlFor="theme-status"
								>
									Dark Mode
								</label>
								<Toggle
									id="theme-status"
									defaultChecked={theme == "dark"}
									onChange={handleThemeChange}
								/>
							</div>

							<select
								className="select-css"
								onChange={event => changeLanguage(event)}
								disabled={!isEditorReady}
							>
								<option value="cpp">C++ 17</option>
								<option value="java">Java</option>
								<option value="javascript">Javascript</option>
								<option value="python">Python 3.6</option>
								<option value="c">C</option>
							</select>

							{/* <button
								onClick={toggleLanguage}
								disabled={!isEditorReady}
							>
								Toggle language
							</button> */}
						</div>
					</div>
				</div>

				<div style={{ border: "1px solid grey", borderRadius: "8px" }}>
					<Editor
						height="100vh" // By default, it fully fits with its parent
						theme={theme}
						language={language}
						loading={<Loader />}
						value={"//Code your heart out here!"}
						editorDidMount={handleEditorDidMount}
						options={{ lineNumbers: "on" }}
					/>
				</div>
			</div>
		</>
	);
}
