import React from 'react';
import {Link} from 'react-router-dom'
import { Button, Result } from 'antd';
const NotFoundPage = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={<Button><Link to="/" type="primary">Back Home</Link></Button>}
  />
);
export default NotFoundPage;