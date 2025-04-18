"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import TradeList from "./TradeList";
import { Container, Row, Col, Form, Card, Spinner } from "react-bootstrap";

const BacktestPage = () => {
  const [symbols, setSymbols] = useState({});
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("DAY");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://forex-trading-2.onrender.com/get_symbols/");
        setSymbols(response.data);
  
        if (Object.keys(response.data).length > 0) {
          // Check if BTCUSDT exists in the response
          if (response.data["BTCUSDT"]) {
            setSymbol("BTCUSDT");
            // Check if DAY timeframe exists for BTCUSDT
            if (response.data["BTCUSDT"]["DAY"]) {
              setTimeframe("DAY");
            } else {
              // Default to first available timeframe for BTCUSDT
              setTimeframe(Object.keys(response.data["BTCUSDT"])[0]);
            }
          } else {
            // Fall back to first available symbol and timeframe
            const firstSymbol = Object.keys(response.data)[0];
            setSymbol(firstSymbol);
            setTimeframe(Object.keys(response.data[firstSymbol])[0]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching symbols:", error);
        setLoading(false);
      }
    };
  
    fetchSymbols();
  }, []);

  return (  
    <section className="main-section">
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold text-primary">Forex Strategy Backtester</h1>
        <p className="lead text-secondary">Analyze historical trading performance with precision</p>
      </div>

      {/* Symbol and Timeframe Selectors */}
      <Card className="shadow-sm mb-4 mx-auto" style={{ maxWidth: "800px" }}>
        <Card.Body>
          <Row className="justify-content-center g-3">
            {/* Symbol Dropdown */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <i className="bi bi-currency-exchange me-1"></i> Trading Pair
                </Form.Label>
                <Form.Select
                  value={symbol}
                  onChange={(e) => {
                    const newSymbol = e.target.value;
                    setSymbol(newSymbol);
                    const availableTimeframes = Object.keys(symbols[newSymbol] || {});
                    setTimeframe(availableTimeframes.includes(timeframe) ? timeframe : availableTimeframes[0]);
                    setPage(1);
                  }}
                  disabled={loading}
                  className="form-select-lg"
                >
                  {loading ? (
                    <option value="">Loading symbols...</option>
                  ) : (
                    Object.keys(symbols).map((sym) => (
                      <option key={sym} value={sym}>{sym}</option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Timeframe Dropdown */}
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">
                  <i className="bi bi-calendar-range me-1"></i> Timeframe
                </Form.Label>
                <Form.Select
                  value={timeframe}
                  onChange={(e) => {
                    setTimeframe(e.target.value);
                    setPage(1);
                  }}
                  disabled={loading || !symbol}
                  className="form-select-lg"
                >
                  {loading ? (
                    <option value="">Loading timeframes...</option>
                  ) : (
                    symbols[symbol] &&
                    Object.keys(symbols[symbol]).map((tf) => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results Section */}
      <Card className="shadow mx-auto" style={{ maxWidth: "1200px" }}>
        {symbol && timeframe ? (
          <TradeList symbol={symbol} timeframe={timeframe} page={page} setPage={setPage} />
        ) : (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" style={{ width: "3rem", height: "3rem" }} />
            <p className="mb-0 lead">Loading trade data...</p>
          </Card.Body>
        )}
      </Card>
    </section>
  );
};

export default BacktestPage;