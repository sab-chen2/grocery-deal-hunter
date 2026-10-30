'use client';

import { useState, type FormEvent } from 'react';
import { useShoppingList } from './use-shopping-list';

export default function ShoppingListPanel({ onClose }: { onClose?: () => void }) {
  const { items, canSave, addItem, setQuantity, removeItem, count } = useShoppingList();
  const [name, setName] = useState('');
  const [quantity, setQuantityInput] = useState('1');
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addItem(name, Number(quantity)); setAnnouncement(`${name.trim()} added to your list.`);
      setName(''); setQuantityInput('1'); setError('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to add item.'); }
  }
  return <section className="shopping-panel" aria-labelledby="shopping-panel-title">
    <div className="shopping-panel-heading"><div><p className="eyebrow">PLAN YOUR NEXT TRIP</p><h2 id="shopping-panel-title">My shopping list</h2></div>{onClose && <button type="button" className="shopping-close" onClick={onClose} aria-label="Close shopping list">×</button>}</div>
    <p className="shopping-description">Add anything you need, with or without a discount.</p>
    <form className="shopping-add-form" onSubmit={submit}>
      <label htmlFor="shopping-item-name">Grocery item</label><input id="shopping-item-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. eggs, apples, coffee" maxLength={100} required />
      <div className="shopping-add-actions"><label htmlFor="shopping-item-quantity">Quantity<input id="shopping-item-quantity" type="number" min={1} max={999} step={1} value={quantity} onChange={(event) => setQuantityInput(event.target.value)} required /></label><button type="submit">Add item</button></div>
    </form>
    {error && <p className="shopping-error" role="alert">{error}</p>}
    <p className="shopping-summary">{items.length} {items.length === 1 ? 'item' : 'items'} · {count} total units</p>
    <p className="sr-only" role="status">{announcement}</p>
    {!items.length ? <div className="shopping-empty"><strong>Your list starts here.</strong><p>Add an item above or use “Add to list” on a store product.</p></div> : <ul className="shopping-items">{items.map((item) => <li key={item.id}>
      <div className="shopping-item-name"><strong>{item.name}</strong>{item.size && <span>{item.size}</span>}<button className="shopping-remove" onClick={() => { removeItem(item.id); setAnnouncement(`${item.name} removed.`); }} aria-label={`Remove ${item.name}`}>Remove</button></div>
      <div className="quantity-control"><button type="button" disabled={item.quantity <= 1} onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`}>−</button><input key={`${item.id}:${item.quantity}`} aria-label={`Quantity of ${item.name}`} type="number" min={1} max={999} step={1} defaultValue={item.quantity} onBlur={(event) => {
        const value = Number(event.target.value);
        if (Number.isInteger(value) && value >= 1 && value <= 999) { setQuantity(item.id, value); setError(''); }
        else { event.target.value = String(item.quantity); setError('Quantity must be a whole number from 1 to 999.'); }
      }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><button type="button" disabled={item.quantity >= 999} onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`}>+</button></div>
    </li>)}</ul>}
    <p className="shopping-save-note" role="status">{canSave ? 'Saved in this browser. No account needed.' : 'Browser storage is unavailable. Your list will last for this session only.'}</p>
  </section>;
}
