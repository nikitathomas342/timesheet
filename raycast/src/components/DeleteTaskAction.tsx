import { Action, Icon } from '@raycast/api'

export const DeleteTaskAction = (props: { onDelete: () => void }) => {
  return (
    <Action
      icon={Icon.Trash}
      title="Delete Task"
      shortcut={{ modifiers: ['ctrl'], key: 'x' }}
      style={Action.Style.Destructive}
      onAction={props.onDelete}
    />
  )
}
