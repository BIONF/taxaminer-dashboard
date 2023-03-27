/**
 * DATASET MANAGEMENT
 */

import { DiamondRow } from "./structures";


/**
 * Verify that a path leads to a legitimate taXaminer result folder
 * @param base_url API base url 
 * @param path path to query
 * @returns boolean, true if path is valid
 */
export function verifyPath(base_url: string, path: string) {
    return fetch(`http://${base_url}:5500/data/verify_path?path=${path}`)
    .then(response => response.json())
    .then(data => data.valid)
}

/**
 * Add a path pointing towards a taXaminer output fodler 
 * @param base_url API base URL
 * @param path path to add
 * @returns fetch() function call
 */
export function addPath(base_url: string, name: string, path: string) {
    const endpoint = `http://${base_url}:5500/data/path`;
    const request = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify({ path: path, name: name })
    };
    return fetch(endpoint, request)

}


export async function listDatasets(base_url: string) {
    const endpoint = `http://${base_url}:5500/api/v1/data/datasets`;
    const default_values = [{id: -1, title: "Select a dataset",  text: "A sample dataset to test on small scale"}]
	await fetch(endpoint)
		.then(response => response.json())
		.then(data => {
            // append
            default_values.push(...data)
        })
        .catch((reason: string) => {
            console.error(reason)
        })
    return default_values
}

/**
 * Remove a dataset 
 * @param base_url API base URL
 * @param dataset_id ID of the dataset (number)
 * @returns Promise
 */
export function removeDataset(base_url: string, dataset_id: number) {
    const endpoint = `http://${base_url}:5500/api/v1/data/remove?id=${dataset_id}`;
    return fetch(endpoint)
}

/**
 * Fetch dataset metadata
 * @param base_url API base URL
 * @param dataset_id ID of the dataset (number)
 * @returns Promise
 */
export function fetchMetaData(base_url: string, dataset_id: number) {
    const endpoint = `http://${base_url}:5500/api/v1/data/summary?id=${dataset_id}`;
    return fetch(endpoint)
}


/**
 * Fetch PCA data
 * @param base_url API base URL 
 * @param dataset_id dataset ID
 * @returns fetch() promise
 */
export function FetchPCA(base_url: string, dataset_id: number) {
    const endpoint = `http://${base_url}:5500/api/v1/data/pca_contribution?id=${dataset_id}`;
	return fetch(endpoint)
    .then(response => response.json())
    .then(data => data)
}

/**
 * Fetch the amino acid sequence of a given ID of a given dataset
 * @param base_url API base url
 * @param dataset_id dataset id
 * @param fasta_header fasta id (string)
 * @returns string representation of the amino acid sequence
 */
export function fetchFasta(base_url: string, dataset_id: number, fasta_header: string) {
	return fetch(`http://${base_url}:5500/api/v1/data/seq?id=${dataset_id}&fasta_id=${fasta_header}`)
		.then(response => response.json())
		.then(data => data)
        .catch((error) => {
            console.error(error);
        });
}


/**
 * Fetch the diamond hits of a given ID of a given dataset
 * @param base_url API base url
 * @param dataset_id dataset id
 * @param fasta_header fasta id (string)
 * @returns list of rows as JSON objects
 */
export function fetchDiamond(base_url: string, dataset_id: number, fasta_header: string): Promise<DiamondRow[]> {
	return fetch(`http://${base_url}:5500/api/v1/data/diamond?id=${dataset_id}&fasta_id=${fasta_header}`)
		.then(response => response.json())
		.then(data => data)
        .catch((error) => {
            console.error(error);
        });
}


/**
 * Store user selection to disk
 * @param base_url API base url
 * @param dataset_id dataset id
 * @param selection set of strings (keys)
 * @returns 
 */
export function setSelection(base_url: string, dataset_id: number, selection: Set<string>) {
    // Build request body
    const request = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify({ selection: Array.from(selection)})
    };
  
    return fetch(`http://${base_url}:5500/api/v1/data/userconfig?dataset_id=${dataset_id}`, request)
    .catch((error) => {
        console.error(error);
    });

}


/**
 * Fetch user selection specific to a dataset
 * @param base_url API base URL
 * @param dataset_id dataset id
 * @returns list of strings (keys)
 */
export function getUserSelection(base_url: string, dataset_id: number) {
	return fetch(`http://${base_url}:5500/api/v1/data/userconfig?dataset_id=${dataset_id}`)
	.then(response => response.json())
    .then(data => new Set<string>(data.selection))
}


/**
 * Fetch a .fasta file blob
 * @param base_url API base URL
 * @param dataset_id dataset id
 * @param body request body
 * @returns Promise
 */
export function getFastaDownload(base_url: string, dataset_id: number, body: any) {
    return fetch(`http://${base_url}:5500/download/fasta?id=${dataset_id}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => { return res.blob(); })
}
