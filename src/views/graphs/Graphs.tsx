import React, { useState, useEffect } from 'react';
import { Client } from '../../db/database'

interface Graph {
  // ...properties that match your Dart Graph model (e.g. account, graphPoints)...
}


const Graphs: React.FC = () => {
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedGraph, setSelectedGraph] = useState<Graph | null>(null);

  useEffect(() => {
    // 1) Fetch clients from Firestore/REST API
    // ...existing code...
    // setAllClients(fetchedClients);
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    // Default to the first graph
    setSelectedGraph(client.graphs?.[0] || null);
  };

  const handleGraphSelect = (graph: Graph) => {
    setSelectedGraph(graph);
  };

  return (
    <div className="c-body">
      <div className="container">
        {/* 2) Client selection */}
        <div>
          <h3>Select a Client</h3>
          {/* Example: simple dropdown, or a list of buttons */}
          <select
            onChange={(e) => {
              const client = allClients.find((c) => c.cid === e.target.value);
              if (client) handleClientSelect(client);
            }}
            value={selectedClient?.cid || ''}
          >
            <option value="">-- Select --</option>
            {allClients.map((client) => (
              <option key={client.cid} value={client.cid}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* 3) Graph selection if multiple graphs per client */}
        {selectedClient && selectedClient.graphs && selectedClient.graphs.length > 1 && (
          <div>
            <h4>Select a Graph</h4>
            <select
              onChange={(e) => {
                const graph = selectedClient.graphs?.find((g) => g.account === e.target.value);
                if (graph) handleGraphSelect(graph);
              }}
              value={selectedGraph?.account || ''}
            >
              {selectedClient.graphs.map((g) => (
                <option key={g.account} value={g.account}>
                  {g.account}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4) Chart area - replicate line_chart.dart logic */}
        {selectedGraph ? (
          <div style={{ marginTop: 20 }}>
            <h4>Graph for {selectedGraph.account}</h4>
            {/* Render chart using selectedGraph.graphPoints */}
            {/* Example with a library like Recharts or Chart.js */}
            {/* ...existing code... */}
          </div>
        ) : (
          <p>No graph selected</p>
        )}
      </div>
    </div>
  );
};

export default Graphs;