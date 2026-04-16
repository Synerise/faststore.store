import React from "react";

import styles from "./History.module.scss";

type TransactionEntry = {
  id: string;
  date: string;
  amount: number;
};

type PointsEntry = {
  date: string;
  amount: number;
};

type HistoryProps = {
  data?: Record<string, unknown>;
  error?: unknown;
};

const History = ({ data, error }: HistoryProps) => {
  const transactions = (data?.transactionData as TransactionEntry[]) ?? [];
  const pointsHistory = (data?.pointsData as PointsEntry[]) ?? [];

  return (
    <>
      <div className={styles.section}>
        <h3>Transaction History</h3>
        {error ? (
          <span>Unable to load transactions</span>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{tx.date}</td>
                  <td>${Number(tx.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.section}>
        <h3>Points History</h3>
        {error ? (
          <span>Unable to load points history</span>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {pointsHistory.map((entry, i) => (
                <tr key={`${entry.date}-${i}`}>
                  <td>{entry.date}</td>
                  <td>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default History;
