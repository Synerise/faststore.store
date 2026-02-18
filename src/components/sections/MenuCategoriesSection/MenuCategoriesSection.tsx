import React from "react";
import { Link } from "@faststore/ui";
import type { MenuCategoriesSectionProps } from "./MenuCategoriesSection.types";
import styles from "./MenuCategoriesSection.module.scss";

const MenuCategoriesSection = ({
  backgroundColor,
  textColor,
  menu = [],
}: MenuCategoriesSectionProps) => {
  const items = (menu ?? []).filter(
    (item) => item && (item.text?.trim() || item.link?.trim()),
  );

  if (!items.length) {
    return null;
  }

  return (
    <nav
      className={styles.section}
      data-fs-menu-categories
      style={{ backgroundColor }}
    >
      <ul className={styles.nav}>
        {items.map((item, index) => (
          <li
            key={item.text && item.link ? `${item.text}-${item.link}` : `menu-${index}`}
            className={styles.item}
          >
            <Link
              href={item.link?.trim() || "#"}
              className={styles.link}
              style={{ color: textColor }}
            >
              {item.text?.trim() || item.link?.trim() || "Link"}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MenuCategoriesSection;
