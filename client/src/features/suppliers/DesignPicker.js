import { useState } from 'react';
import { Select, Space } from 'antd';
import {
  useVariants,
  useCategories,
  useSubcategories,
  useDesigns,
} from '../catalogue/services/catalogueQueries.js';

const toOptions = (items = []) =>
  items.map((i) => ({ value: i._id, label: `${i.name} (${i.code})` }));

/**
 * Cascading Variant → Category → Sub-category → Design selector.
 * Calls onChange(designId) when a leaf design is chosen.
 */
export default function DesignPicker({ value, onChange }) {
  const [variant, setVariant] = useState(null);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);

  const variants = useVariants();
  const categories = useCategories(variant);
  const subcategories = useSubcategories(category);
  const designs = useDesigns(subcategory);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="small">
      <Select
        placeholder="Select variant"
        style={{ width: '100%' }}
        value={variant}
        options={toOptions(variants.data)}
        loading={variants.isLoading}
        onChange={(v) => {
          setVariant(v);
          setCategory(null);
          setSubcategory(null);
          onChange?.(undefined);
        }}
      />
      <Select
        placeholder="Select category"
        style={{ width: '100%' }}
        value={category}
        disabled={!variant}
        options={toOptions(categories.data)}
        loading={categories.isLoading}
        onChange={(v) => {
          setCategory(v);
          setSubcategory(null);
          onChange?.(undefined);
        }}
      />
      <Select
        placeholder="Select sub-category"
        style={{ width: '100%' }}
        value={subcategory}
        disabled={!category}
        options={toOptions(subcategories.data)}
        loading={subcategories.isLoading}
        onChange={(v) => {
          setSubcategory(v);
          onChange?.(undefined);
        }}
      />
      <Select
        placeholder="Select design"
        style={{ width: '100%' }}
        value={value}
        disabled={!subcategory}
        options={toOptions(designs.data)}
        loading={designs.isLoading}
        onChange={(v) => onChange?.(v)}
      />
    </Space>
  );
}