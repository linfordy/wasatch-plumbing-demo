"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  id: string;            // for localStorage key
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ id, title, defaultOpen = true, children }: Props) {
  const storageKey = `larrys_admin_collapse_${id}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is client-only; hydration from it requires setState in effect
    if (saved !== null) setOpen(saved === "1");
  }, [storageKey]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(storageKey, next ? "1" : "0");
  };

  return (
    <div className="bg-brand-dark border border-brand-darker rounded-xl mb-8 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-brand-darker/40 transition-colors"
        aria-expanded={open}
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <span
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
