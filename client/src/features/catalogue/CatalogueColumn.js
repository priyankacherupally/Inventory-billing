import { Button, Empty, Spin, Tag, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  RightOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { ROLES } from '../../config/apiConfig.js';
import styles from './Catalogue.module.scss';

/**
 * One column of the cascading catalogue (Variant / Category / Sub-category /
 * Design). Selectable columns drive the next column to the right.
 */
export default function CatalogueColumn({
  title,
  items = [],
  loading,
  selectedId,
  selectable = true,
  disabled = false,
  disabledHint,
  onSelect,
  onAdd,
  onEdit,
  onToggleStatus,
  renderMeta,
}) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{title}</span>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAdd}
          disabled={disabled}
        >
          Add
        </Button>
      </div>

      <div className={styles.columnBody}>
        {disabled ? (
          <div className={styles.placeholder}>{disabledHint}</div>
        ) : loading ? (
          <div className={styles.placeholder}>
            <Spin />
          </div>
        ) : items.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nothing yet"
            style={{ marginTop: 32 }}
          />
        ) : (
          items.map((item) => {
            const isActive = item.status === 'active';
            const isSelected = selectable && selectedId === item._id;
            return (
              <div
                key={item._id}
                className={`${styles.row} ${isSelected ? styles.rowSelected : ''} ${
                  !isActive ? styles.rowInactive : ''
                }`}
                onClick={() => selectable && onSelect?.(item._id)}
              >
                <div className={styles.rowMain}>
                  <div className={styles.rowName}>{item.name}</div>
                  <div className={styles.rowMeta}>
                    <span className={styles.code}>{item.code}</span>
                    {renderMeta?.(item)}
                  </div>
                </div>

                <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                  {!isActive && <Tag color="default">Inactive</Tag>}
                  <Tooltip title="Edit">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit?.(item)}
                    />
                  </Tooltip>
                  <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                    <Button
                      type="text"
                      size="small"
                      danger={isActive}
                      icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                      onClick={() => onToggleStatus?.(item)}
                    />
                  </Tooltip>
                  {selectable && <RightOutlined className={styles.chevron} />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export const CATALOGUE_VIEW_ROLES = [ROLES.ADMIN];