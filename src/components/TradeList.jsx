"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Pagination, Badge, Card, OverlayTrigger, Tooltip } from "react-bootstrap";

const TradeList = ({ symbol, timeframe, page, setPage }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const limitPerPage = 20;

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!symbol || !timeframe) {
          setError("Please select a symbol and timeframe.");
          setLoading(false);
          return;
        }

        const response = await axios.get("https://forex-trading-2.onrender.com/backtest/", {
          params: { symbol, timeframe, page, limit: limitPerPage },
        });
        
        if (!response.data.signals || response.data.signals.length === 0) {
          setError("No trade history available.");
          setTrades([]);
          setLoading(false);
          return;
        }

        setTrades(response.data.signals);
        setTotalPages(response.data.summary.total_pages);
      } catch (err) {
        setError("Failed to load trade history.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [symbol, timeframe, page]);

  return (
    <>
      <Card.Header className="bg-light py-3">
        <div className="d-flex align-items-center justify-content-center gap-2">
          <span className="badge bg-primary fs-6 p-2">📊</span>
          <h3 className="mb-0">
          Trade History for <span className="text-primary">{symbol}</span> ({timeframe})
        </h3>
        </div>
      
      </Card.Header>
      <Card.Body className="p-0 p-md-3">
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="mb-0">Loading trade data...</p>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className="m-3 text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}
        
        {!loading && !error && trades.length > 0 && (
          <div className="table-responsive">
            <Table striped bordered hover responsive className="m-0">
              <thead className="bg-primary text-white">
                <tr className="text-center">
                  <th>#</th>
                  <th>Type</th>
                  <th>Entry Price</th>
                  <th>Target</th>
                  <th>Stop Loss</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr key={index} className="text-center">
                    <td>{(page - 1) * limitPerPage + index + 1}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{trade.type === "BUY" ? "Buy Trade" : "Sell Trade"}</Tooltip>}
                      >
                        <Badge bg={trade.type === "BUY" ? "success" : "danger"} 
                               style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}>
                          {trade.type}
                        </Badge>
                      </OverlayTrigger>
                    </td>
                    <td>${trade.entry_price.toFixed(4)}</td>
                    <td>${trade.target.toFixed(4)}</td>
                    <td>${trade.stop_loss.toFixed(4)}</td>
                    <td className="text-nowrap">{new Date(trade.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        
        {!loading && !error && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
              <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />

              {/* Page 1 */}
              <Pagination.Item active={page === 1} onClick={() => setPage(1)}>1</Pagination.Item>

              {/* Page 2 (if totalPages > 1) */}
              {totalPages > 1 && (
                <Pagination.Item active={page === 2} onClick={() => setPage(2)}>2</Pagination.Item>
              )}

              {/* Show ellipsis if needed */}
              {totalPages > 3 && page > 3 && <Pagination.Ellipsis disabled />}
              
              {/* Current page if not 1 or 2 */}
              {page > 2 && page < totalPages && (
                <Pagination.Item active={true}>{page}</Pagination.Item>
              )}
              
              {/* Show ellipsis if needed */}
              {totalPages > 3 && page < totalPages - 1 && <Pagination.Ellipsis disabled />}

              {/* Last page if totalPages > 2 */}
              {totalPages > 2 && (
                <Pagination.Item active={page === totalPages} onClick={() => setPage(totalPages)}>
                  {totalPages}
                </Pagination.Item>
              )}

              <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
              <Pagination.Last disabled={page === totalPages} onClick={() => setPage(totalPages)} />
            </Pagination>
          </div>
        )}
      </Card.Body>
    </>
  );
};

export default TradeList;