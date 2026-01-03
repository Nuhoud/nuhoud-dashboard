import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsFeedExample = ({ token, pageSize = 20 }) => {
  const { notifications, loadMore, hasMore, loading, error } = useNotifications(token, pageSize);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.shadows[1],
      }}
    >
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Showing {notifications.length}
          {hasMore ? '+' : ''}
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
        {notifications.map((item, index) => (
          <React.Fragment key={item._id}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <>
                    {item.body && (
                      <Typography variant="body2" color="text.secondary">
                        {item.body}
                      </Typography>
                    )}
                    {!!Object.keys(item.data || {}).length && (
                      <Typography variant="caption" color="text.disabled">
                        Payload keys: {Object.keys(item.data).join(', ')}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
        {!notifications.length && !loading && (
          <ListItem>
            <ListItemText primary="No notifications yet." />
          </ListItem>
        )}
      </List>

      <Stack direction="row" justifyContent="center" mt={2}>
        <Button variant="contained" onClick={loadMore} disabled={!hasMore || loading || !token}>
          {loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : hasMore ? (
            'Load more'
          ) : (
            'No more notifications'
          )}
        </Button>
      </Stack>
    </Box>
  );
};

export default NotificationsFeedExample;
