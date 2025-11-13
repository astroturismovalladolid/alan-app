import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(
        <Card>
          <div data-testid="card-content">Card content</div>
        </Card>
      );

      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Card className="custom-card-class">Content</Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('custom-card-class');
    });
  });

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(
        <CardHeader>
          <div data-testid="header-content">Header</div>
        </CardHeader>
      );

      expect(screen.getByTestId('header-content')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(<CardTitle>Test Title</CardTitle>);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should have title styling classes', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);

      const title = screen.getByText('Title');
      expect(title.className).toContain('font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(<CardDescription>Test Description</CardDescription>);

      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should have description styling classes', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);

      const description = screen.getByText('Description');
      expect(description.className).toContain('text-sm');
    });
  });

  describe('CardContent', () => {
    it('should render card content', () => {
      render(
        <CardContent>
          <p>Content text</p>
        </CardContent>
      );

      expect(screen.getByText('Content text')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      );

      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });
  });

  describe('Complete Card', () => {
    it('should render complete card with all sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /footer button/i })).toBeInTheDocument();
    });
  });
});
