import Button from '@mui/material/Button';
import React from "react";

export const ExternalActionRender = function () {
  const { loading } = this.state

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          padding: 32,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div style={{ fontWeight: "bold" }}>{(this.actionTypes[this.props.externalAction])().desc}</div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              type="submit"
              variant="text"
              color="secondary"
              onClick={() => this.cancel()}
              disabled={loading}
              style={{
                width: 120,
                padding: 8,
                marginRight: 32
              }}
            >
              {"Cancel"}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => this.openVerusDesktop()}
              disabled={loading}
              style={{
                width: 200,
                padding: 8,
                marginRight: 32
              }}
            >
              {"Open Verus Desktop"}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => this.tryContinue()}
              disabled={loading}
              style={{
                width: 120,
                padding: 8,
              }}
            >
              {"Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

