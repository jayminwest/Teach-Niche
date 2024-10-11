// CheckoutCard.js
import React from 'react';
import CheckoutButton from './CheckoutButton';

export default function CheckoutCard({ title, price, description, imageUrl, priceId }) {
    return (
        <div className="card w-80 h-auto bg-base-100 shadow-xl overflow-hidden container mx-auto">
            {/* Ensuring the image container has a fixed height */}
            <figure className="h-48 overflow-hidden">
                {/* Image standardized to cover the area of the figure, maintaining aspect ratio */}
                <img src={imageUrl} alt="Lesson" className="w-full h-full object-cover"/>
            </figure>
            <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <p>{price}</p>
                <p>{description}</p>
                <CheckoutButton priceId={priceId}>Buy Tutorial</CheckoutButton>
            </div>
        </div>
  );
}
