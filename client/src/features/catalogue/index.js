import { useMemo, useState } from 'react';
import {
  Form,
  Input,
  Modal,
  Segmented,
  Typography,
  message,
} from 'antd';
import CatalogueColumn from './CatalogueColumn.js';
import styles from './Catalogue.module.scss';
import {
  useVariants,
  useCategories,
  useSubcategories,
  useDesigns,
  useCreateVariant,
  useUpdateVariant,
  useCreateCategory,
  useUpdateCategory,
  useCreateSubcategory,
  useUpdateSubcategory,
  useCreateDesign,
  useUpdateDesign,
} from './services/catalogueQueries.js';

const { Title } = Typography;

const LEVELS = {
  variant: { title: 'Variant', label: 'Variant' },
  category: { title: 'Category', label: 'Category' },
  subcategory: { title: 'Sub-category', label: 'Sub-category' },
  design: { title: 'Design', label: 'Design' },
};

export default function Catalogue() {
  const [form] = Form.useForm();
  const [selVariant, setSelVariant] = useState(null);
  const [selCategory, setSelCategory] = useState(null);
  const [selSubcategory, setSelSubcategory] = useState(null);
  const [modal, setModal] = useState({ open: false, level: null, mode: 'create', item: null });

  const variants = useVariants();
  const categories = useCategories(selVariant);
  const subcategories = useSubcategories(selCategory);
  const designs = useDesigns(selSubcategory);

  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();

  const variantObj = useMemo(
    () => variants.data?.find((v) => v._id === selVariant),
    [variants.data, selVariant],
  );
  const categoryObj = useMemo(
    () => categories.data?.find((c) => c._id === selCategory),
    [categories.data, selCategory],
  );
  const subcategoryObj = useMemo(
    () => subcategories.data?.find((s) => s._id === selSubcategory),
    [subcategories.data, selSubcategory],
  );

  const onSelectVariant = (id) => {
    setSelVariant(id);
    setSelCategory(null);
    setSelSubcategory(null);
  };
  const onSelectCategory = (id) => {
    setSelCategory(id);
    setSelSubcategory(null);
  };

  const openCreate = (level) => {
    setModal({ open: true, level, mode: 'create', item: null });
    form.resetFields();
  };
  const openEdit = (level, item) => {
    setModal({ open: true, level, mode: 'edit', item });
    form.setFieldsValue({ name: item.name, status: item.status });
  };
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const parentCodePrefix = () => {
    if (modal.level === 'category') return variantObj?.code;
    if (modal.level === 'subcategory') return categoryObj?.code;
    return null;
  };

  const mutationFor = (level, mode) =>
    ({
      variant: mode === 'create' ? createVariant : updateVariant,
      category: mode === 'create' ? createCategory : updateCategory,
      subcategory: mode === 'create' ? createSubcategory : updateSubcategory,
      design: mode === 'create' ? createDesign : updateDesign,
    })[level];

  const buildPayload = (level, mode, values, item) => {
    if (mode === 'edit') {
      const base = { id: item._id, name: values.name, status: values.status };
      if (level === 'category') return { ...base, variantId: selVariant };
      if (level === 'subcategory') return { ...base, categoryId: selCategory };
      if (level === 'design') return { ...base, subcategoryId: selSubcategory };
      return base;
    }
    // create
    if (level === 'variant') return { name: values.name, code: values.code };
    if (level === 'category')
      return { variantId: selVariant, name: values.name, codeSuffix: values.codeSuffix };
    if (level === 'subcategory')
      return { categoryId: selCategory, name: values.name, codeSuffix: values.codeSuffix };
    return { subcategoryId: selSubcategory, name: values.name };
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const { level, mode, item } = modal;
    const mutation = mutationFor(level, mode);
    try {
      await mutation.mutateAsync(buildPayload(level, mode, values, item));
      message.success(`${LEVELS[level].label} ${mode === 'create' ? 'created' : 'updated'}`);
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      message.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const toggleStatus = async (level, item) => {
    const mutation = mutationFor(level, 'edit');
    const next = item.status === 'active' ? 'inactive' : 'active';
    const payload = { id: item._id, name: item.name, status: next };
    if (level === 'category') payload.variantId = selVariant;
    if (level === 'subcategory') payload.categoryId = selCategory;
    if (level === 'design') payload.subcategoryId = selSubcategory;
    try {
      await mutation.mutateAsync(payload);
      message.success(`${LEVELS[level].label} ${next === 'active' ? 'activated' : 'deactivated'}`);
    } catch {
      message.error('Could not update status');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <Title level={3} style={{ margin: 0 }}>
          Product Catalogue
        </Title>
      </div>
      <p className={styles.subtitle}>
        Build the 4-level hierarchy. Select an item to drill into the next level.
        Codes are generated automatically from the parent.
      </p>

      <div className={styles.columns}>
        <CatalogueColumn
          title="Variants"
          items={variants.data}
          loading={variants.isLoading}
          selectedId={selVariant}
          onSelect={onSelectVariant}
          onAdd={() => openCreate('variant')}
          onEdit={(item) => openEdit('variant', item)}
          onToggleStatus={(item) => toggleStatus('variant', item)}
        />
        <CatalogueColumn
          title="Categories"
          items={categories.data}
          loading={categories.isLoading}
          selectedId={selCategory}
          disabled={!selVariant}
          disabledHint="Select a variant to view its categories"
          onSelect={onSelectCategory}
          onAdd={() => openCreate('category')}
          onEdit={(item) => openEdit('category', item)}
          onToggleStatus={(item) => toggleStatus('category', item)}
        />
        <CatalogueColumn
          title="Sub-categories"
          items={subcategories.data}
          loading={subcategories.isLoading}
          selectedId={selSubcategory}
          disabled={!selCategory}
          disabledHint="Select a category to view its sub-categories"
          onSelect={setSelSubcategory}
          onAdd={() => openCreate('subcategory')}
          onEdit={(item) => openEdit('subcategory', item)}
          onToggleStatus={(item) => toggleStatus('subcategory', item)}
        />
        <CatalogueColumn
          title="Designs"
          items={designs.data}
          loading={designs.isLoading}
          selectable={false}
          disabled={!selSubcategory}
          disabledHint="Select a sub-category to view its designs"
          onAdd={() => openCreate('design')}
          onEdit={(item) => openEdit('design', item)}
          onToggleStatus={(item) => toggleStatus('design', item)}
          renderMeta={(item) => (
            <span className={styles.stock}>{item.totalStock} in stock</span>
          )}
        />
      </div>

      <Modal
        title={`${modal.mode === 'create' ? 'Add' : 'Edit'} ${
          modal.level ? LEVELS[modal.level].label : ''
        }`}
        open={modal.open}
        onOk={handleSubmit}
        onCancel={closeModal}
        okText={modal.mode === 'create' ? 'Create' : 'Save'}
        confirmLoading={mutationFor(modal.level || 'variant', modal.mode).isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, min: 2, message: 'Name is required' }]}
          >
            <Input placeholder="e.g. Mal Mal Cotton" autoFocus />
          </Form.Item>

          {/* Create-only code fields */}
          {modal.mode === 'create' && modal.level === 'variant' && (
            <Form.Item
              label="Code"
              name="code"
              rules={[
                { required: true, message: 'Code is required' },
                { pattern: /^[A-Za-z0-9]{2,6}$/, message: '2–6 letters/numbers' },
              ]}
              extra="Short code, e.g. CTN. Immutable once created."
            >
              <Input placeholder="CTN" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          )}

          {modal.mode === 'create' &&
            (modal.level === 'category' || modal.level === 'subcategory') && (
              <Form.Item
                label="Code suffix"
                name="codeSuffix"
                rules={[
                  { required: true, message: 'Code suffix is required' },
                  { pattern: /^[A-Za-z0-9]{2,6}$/, message: '2–6 letters/numbers' },
                ]}
                extra={
                  <>
                    Full code will be{' '}
                    <span className={styles.codePreview}>{parentCodePrefix()}-…</span>
                  </>
                }
              >
                <Input
                  addonBefore={`${parentCodePrefix() || ''}-`}
                  placeholder={modal.level === 'category' ? 'MLM' : 'PRT'}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            )}

          {modal.mode === 'create' && modal.level === 'design' && (
            <Form.Item label="Code" extra="Auto-generated on save.">
              <Input
                disabled
                value={`${subcategoryObj?.code || ''}-NNN`}
              />
            </Form.Item>
          )}

          {/* Edit-only status toggle */}
          {modal.mode === 'edit' && (
            <Form.Item label="Status" name="status">
              <Segmented
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}