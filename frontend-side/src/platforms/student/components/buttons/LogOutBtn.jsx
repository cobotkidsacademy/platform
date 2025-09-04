import React from 'react';
import { Link } from "react-router-dom";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

function LogOutBtn() {
  return (
    <Stack spacing={2} direction="row">
      <Button 
        variant="contained" 
        component={Link} 
        to="/studentauth"
        className="magic-button"
      >
        End Class
      </Button>
    </Stack>
  );
}

export default LogOutBtn;
