// src/components/Input.js
import React, { useState, useEffect } from 'react';
import './Input.css';
import axios from 'axios';
import BACKEND_URL from '../config';
import GraphVisualizer from './GraphVisualizer';

function Input() {
    const [numRouters, setNumRouters] = useState('');
    const [links, setLinks] = useState([]);
    const [initialTable, setInitialTable] = useState(null);
    const [routingTable, setRoutingTable] = useState(null);
    const [adjacencyMatrix, setAdjacencyMatrix] = useState([]);

    useEffect(() => {
        // Initialize an empty adjacency matrix when numRouters is set
        if (numRouters) {
            const matrix = Array.from({ length: parseInt(numRouters) }, () => Array(parseInt(numRouters)).fill(0));
            setAdjacencyMatrix(matrix);
        }
    }, [numRouters]);

    const initializeGraph = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/init`, { num_routers: parseInt(numRouters) });
            console.log(response.data.message);
        } catch (error) {
            console.error("Error initializing graph:", error.response?.data?.error || error.message);
        }
    };

    const addLinks = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/add_link`, { links });
            console.log(response.data.message);
            // Update adjacency matrix based on links
            const matrix = Array.from({ length: parseInt(numRouters) }, () => Array(parseInt(numRouters)).fill(0));
            links.forEach(({ u, v, distance }) => {
                matrix[u][v] = distance;
                matrix[v][u] = distance; // assuming undirected graph
            });
            setAdjacencyMatrix(matrix);
        } catch (error) {
            console.error("Error adding links:", error.response?.data?.error || error.message);
        }
    };

    const fetchInitialTable = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/initial_routing_table`);
            setInitialTable(response.data.initial_table);
            console.log("Initial Table:", response.data.initial_table);
        } catch (error) {
            console.error("Error fetching initial routing table:", error.response?.data?.error || error.message);
        }
    };

    const fetchRoutingTable = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/get_routing_table`);
            setRoutingTable(response.data.pass_results);
            console.log("Routing Table:", response.data.pass_results);
        } catch (error) {
            console.error("Error fetching routing table:", error.response?.data?.error || error.message);
        }
    };

    const handleAddLink = () => {
        setLinks([...links, { u: 0, v: 0, distance: 0 }]);
    };

    const handleLinkChange = (index, field, value) => {
        const newLinks = links.slice();
        newLinks[index][field] = parseInt(value);
        setLinks(newLinks);
    };

    return (
        <div className="container mt-5">
            <div className="rounded">
                <h2>Network Routing Input</h2>
                <div className="form-group">
                    <label>Number of Routers:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={numRouters}
                        onChange={(e) => setNumRouters(e.target.value)}
                    />
                    <button className="btn btn-primary mt-2" onClick={initializeGraph}>
                        Initialize Graph
                    </button>
                </div>

                <h3>Links</h3>
                {links.map((link, index) => (
                    <div key={index} className="form-row mb-2">
                        <input
                            type="number"
                            className="form-control col mr-2"
                            placeholder="u"
                            value={link.u}
                            onChange={(e) => handleLinkChange(index, 'u', e.target.value)}
                        />
                        <input
                            type="number"
                            className="form-control col mr-2"
                            placeholder="v"
                            value={link.v}
                            onChange={(e) => handleLinkChange(index, 'v', e.target.value)}
                        />
                        <input
                            type="number"
                            className="form-control col"
                            placeholder="Distance"
                            value={link.distance}
                            onChange={(e) => handleLinkChange(index, 'distance', e.target.value)}
                        />
                    </div>
                ))}
                <button className="btn btn-secondary" onClick={handleAddLink}>Add Link</button>
                <button className="btn btn-primary mt-2" onClick={addLinks}>Submit Links</button>
            </div>

            <h3 className="mt-4">Graph Visualization</h3>
            <GraphVisualizer adjacencyMatrix={adjacencyMatrix} />

            <h3 className="mt-4">Routing Tables</h3>
            <button className="btn btn-info" onClick={fetchInitialTable}>Get Initial Table</button>
            <button className="btn btn-info ml-2" onClick={fetchRoutingTable}>Get Routing Table</button>

            {initialTable && (
                <div className="mt-3">
                    <h4>Initial Routing Table</h4>
                    <div className="pass-grid">
    {initialTable[0]?.routing_table.map((router, routerIndex) => (
        <div key={routerIndex} className="router-table m-4">
            <h6>Router {routerIndex}</h6>
            <table className="table table-bordered m-4 p-4">
                <thead>
                    <tr>
                        <th>Destination</th>
                        <th>Next Hop</th>
                        <th>Distance</th> {/* New Distance Column */}
                    </tr>
                </thead>
                <tbody>
                    {router.map((distance, destIndex) => (
                        <tr key={destIndex}>
                            <td>{destIndex}</td>
                            <td>
                                {initialTable[0].next_hop[routerIndex][destIndex] ?? 'N/A'}
                            </td>
                            <td>{distance ?? '∞'}</td> {/* Display distance directly from routing_table */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ))}
</div>

                </div>
            )}

            {routingTable && (
                <div className="mt-3">
                    <h4>Routing Table (Pass-wise)</h4>
                    {routingTable.map((passData, passIndex) => (
            <div key={passIndex} className="mt-4">
                <h5>Pass {passData.pass_num}</h5>
                <div className="pass-grid">
                    {passData.routing_table.map((router, routerIndex) => (
                        <div key={routerIndex} className="router-table m-4">
                            <h6>Router {routerIndex}</h6>
                            <table className="table table-bordered m-4 p-4">
                                <thead>
                                    <tr>
                                        {/* <th>Start</th> */}
                                        <th>Destination</th>
                                        <th>Next Hop</th>
                                        <th>Distance</th> {/* New Distance Column */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {router.map((distance, destIndex) => (
                                        <tr key={destIndex}>
                                            {/* <td>{routerIndex}</td> */}
                                            <td>{destIndex}</td>
                                            <td>{passData.next_hop[routerIndex][destIndex] ?? 'N/A'}</td>
                                            <td>{distance ?? '∞'}</td> {/* Display distance directly from routing_table */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        ))}
                </div>
            )}

            
        </div>
    );
}

export default Input;