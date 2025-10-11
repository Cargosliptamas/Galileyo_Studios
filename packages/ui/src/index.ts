import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { cn };

// Export all UI components
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
export { Alert, AlertDescription, AlertTitle } from "./alert";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export { Badge } from "./badge";
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
export { Button } from "./button";
export { Calendar } from "./calendar";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
export { Checkbox } from "./checkbox";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
export { EmojiPicker } from "./emoji-picker";
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
export { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
export { Input } from "./input";
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./input-otp";
export { Label } from "./label";
export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar";
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./navigation-menu";
export { Popover, PopoverContent, PopoverTrigger } from "./popover";
export { Progress } from "./progress";
export { RadioGroup, RadioGroupItem } from "./radio-group";
export { ScrollArea, ScrollBar } from "./scroll-area";
export { SearchableSelect } from "./searchable-select";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
export { Separator } from "./separator";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
export * from "./sidebar";
export { Skeleton } from "./skeleton";
export { Switch } from "./switch";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Textarea } from "./textarea";
export { ThemeProvider } from "./theme";
export { toast, Toaster } from "./toast";
export { Toggle } from "./toggle";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
