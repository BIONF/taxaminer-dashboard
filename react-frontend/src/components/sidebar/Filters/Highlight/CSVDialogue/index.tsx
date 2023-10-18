import { useState } from "react";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";

const CSVDialogue = ({passCloseUp, submitGenes}:{passCloseUp: any, submitGenes: any}) => {
    const [csvText, setCSVText] = useState<string>("");
    const submitCSV = () => {
        const gene_ids = csvText.split(",")
        submitGenes(gene_ids)
        passCloseUp()
    }
    return (
        <Modal show={true}>
            <Modal.Header>
                <Modal.Title>Select comma-separated gene IDs</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FloatingLabel controlId="floatingTextarea2" label="Paste comma-separated gene IDs here">
                    <Form.Control
                    as="textarea"
                    placeholder="Paste Comma-separated gene ids here"
                    style={{ height: '100px' }}
                    value={csvText}
                    onChange={(e: any) => setCSVText(e.target.value.replace(/ /g, ''))}
                    />
                </FloatingLabel>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => passCloseUp()}>Cancel <span className='bi bi-x-circle'/></Button>
                <Button  onClick={() => submitCSV()}>Submit <i className="bi bi-arrow-right-circle"></i></Button> 
            </Modal.Footer>
        </Modal>
    )
}

export default CSVDialogue;