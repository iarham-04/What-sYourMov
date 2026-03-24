import React from 'react';

interface IconProps {
  className?: string;
  fill?: boolean;
}

export const PlusCircle = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>add_circle</span>
);

export const Explore = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>explore</span>
);

export const Bookmarks = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>bookmarks</span>
);

export const AutoAwesome = ({ className, fill }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}>auto_awesome</span>
);

export const Settings = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>settings</span>
);

export const Search = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>search</span>
);

export const Notifications = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>notifications</span>
);

export const AccountCircle = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>account_circle</span>
);

export const Person = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>person</span>
);

export const Movie = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>movie</span>
);

export const ArrowUpward = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>arrow_upward</span>
);

export const AttachFile = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>attach_file</span>
);

export const Close = ({ className }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`}>close</span>
);

export const Star = ({ className, fill }: IconProps) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}>star</span>
);
