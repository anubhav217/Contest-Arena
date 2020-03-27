import React, { useState } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
export default function SubmitModal(props) {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<>
			<Button
				variant="primary"
				onClick={handleShow}
				disabled={props.disabled}
			>
				Submit <i className="fas fa-file-import"></i>
			</Button>

			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Submission Result</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{Math.round(Math.random()) == 0 ? (
						<div className="alert alert-danger">
							Oops! WA. Try again.
						</div>
					) : (
						<div className="alert alert-success">
							AC! You earned it!
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
