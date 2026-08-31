import React, { useState } from 'react';
import styles from './BookCover.module.css';

const BookCover = ({ portada, titulo, size = 'md' }) => {
  const [error, setError] = useState(false);

  if (!portada || error) {
    return (
      <div className={`${styles.cover} ${styles[`size${size}`]} ${styles.placeholder}`}>
        <span>{titulo ? titulo.charAt(0).toUpperCase() : '?'}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.cover} ${styles[`size${size}`]}`}>
      <img
        src={portada}
        alt={titulo || 'Portada'}
        loading="lazy"
        onError={() => setError(true)}
        className={styles.img}
      />
    </div>
  );
};

export default BookCover;
