import React, { Component } from 'react';
import { Container, Form, Button, Modal } from 'react-bootstrap';
import { addPath, verifyPath } from '../../../api';


interface Props {
    base_url: string
    show_modal: boolean
    hide_modal_callback: any
    invalid_names: string[]
}

interface State {
    invalid_name: boolean
    valid_path: boolean
    path: string
    file: any
    uploaded: boolean
    file_name: string
    show_modal: boolean
    keep_zip: boolean
    file_size: number
}

/**
 * Dropdown selector for custom fields to be displayed in the sidebar
 */
class UploadDialogue extends Component<Props, State> {
    constructor(props: any){
        super(props)
        this.state = {  
            invalid_name: false,
            valid_path: false,
            path: "",
            file: new File([""], "filename"),
            uploaded: false,
            file_name: "",
            show_modal: false,
            keep_zip: false,
            file_size: 0
        }
        
    }

    /**
     * Upload a file to file storage
     * @param e event
     */

    // TODO MOVE
    uploadFile() {
        const endpoint = `http://${this.props.base_url}:5500/api/v1/data/upload`;
        // ensure that an actual file was selected
        if (this.state.file_size > 0) {
            const data = new FormData()
            data.append('files', this.state.file)
            data.append('name', this.state.file_name)
            data.append('keep_zip', String(this.state.keep_zip ? 1 : 0))

            if (this.state.file.name.endsWith(".zip")) {
                data.append('type', ".zip")
            } else if (this.state.file.name.endsWith(".tar.gz")) {
                data.append('type', ".tar.gz")
            }

            // POST data
            fetch(endpoint, {
                method: 'POST',
                body: data
            })
            .then(response => response.json())
            // update UI
            .finally(() => {
                this.props.hide_modal_callback(this.state.file_name)
                this.setState({file: new File([""], "filename"), uploaded: true})
               
            })
        }
    }

    /**
     * Store the currently selected file
     * @param e Form.Control input change event
     */
    setFile(e: any) {
        console.log(e)
        if (typeof e.target.files[0] === "undefined") {
            this.setState({file: new File([""], "filename"), file_size: 0})
        }
        this.setState({file: e.target.files[0], path: "", valid_path: false, file_size: e.target.files[0].size})
    }

    /**
     * Check whether a dataset name is empty or already taken
     * @param new_name user input
     */
    checkDatasetName(new_name: string) {
        if (new_name.includes("/")) {
            return this.setState({invalid_name: false})
        }
        this.setState({invalid_name: !this.props.invalid_names.includes(new_name)})
        this.setState({file_name: new_name})
    }

    /**
     * Verify that a given filepath points to a valid taXaminer output
     * @param path 
     */
    checkFilePath(path: string) {
        verifyPath(this.props.base_url, path)
        .then(data => this.setState({valid_path: data}))
        this.setState({path: path})
    }

    /**
     * close the modal and upload files if applies
     * @returns 
     */
    hideModal = () => {
        // add a new local path
        if (this.state.valid_path) {
            console.log("path")
            addPath(this.props.base_url, this.state.file_name, this.state.path)
            .finally(() => {
                this.setState({path: ""})
                this.props.hide_modal_callback("")
            })
        }

        if (this.state.file_size === 0 && !this.state.valid_path) {
            return this.props.hide_modal_callback("")
        }
        this.uploadFile()
    }

    /**
     * Close the modal withou upload
     * @returns 
     */
    cancel = () => {
        this.setState({valid_path: false, invalid_name: false, file: new File([""], "filename")})
        return this.props.hide_modal_callback("")
    }

    render() {
        return (
            <Modal show={this.props.show_modal}>
              <Modal.Header>
                <Modal.Title><span className='bi bi-file-zip m-2'/> Import new dataset</Modal.Title>
              </Modal.Header>
              <Modal.Body>
              <Container>
              
                <Form noValidate validated={false}>
                    <Form.Group>
                        <Form.Text>Dataset Name</Form.Text>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Choose a custom unique name"
                            isInvalid={!this.state.invalid_name}
                            onChange={(e: any) => this.checkDatasetName(e.target.value)}
                            />
                        <Form.Control.Feedback type="invalid">
                            Name not available or empty
                        </Form.Control.Feedback>
                    </Form.Group>
                    <br/>
                    <h5>Upload archive</h5>
                    <Form.Group>
                        <Form.Text>Select a file</Form.Text>
                        <Form.Control 
                            type="file"
                            onChange={(e: any) => this.setFile(e)}
                            accept={`.zip, .tar.gz`}
                            disabled={this.state.path !== ""}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Text>Advanced settings</Form.Text>
                        <Form.Check label={"Keep original archive in working directory"} onChange={(e: any) => this.setState({keep_zip: e.target.checked})} disabled={this.state.valid_path}/>
                    </Form.Group>
                </Form>

                <br/>
                <h5>Or add from disk using filepath</h5>
                <Form noValidate validated={false}>
                    <Form.Group>
                        <Form.Text>Enter filepath pointing to a taXaminer output directory. On Windows systems this requires <a href="https://blogs.windows.com/windowsdeveloper/2016/12/02/symlinks-windows-10/" target="_blank" rel="noreferrer">additional symlink privileges.</a></Form.Text>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Filepath"
                            isInvalid={!this.state.valid_path}
                            onChange={(e: any) => this.checkFilePath(e.target.value)}
                            disabled={this.state.file_size > 0}
                            />
                        <Form.Control.Feedback type="invalid">
                            Invalid filepath
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </Container>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={this.cancel} variant="danger"><span className='bi bi-x-circle m-2'/>Cancel</Button>
                <Button onClick={this.hideModal} disabled={!(this.state.invalid_name && (this.state.file_size !== 0 || this.state.valid_path))}><span className='bi bi-upload m-2'/>Submit</Button>
              </Modal.Footer>
            </Modal>
        );
  }
}
export default UploadDialogue;